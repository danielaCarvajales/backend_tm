import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from '../login.use-case';
import { Credentials } from '../../../../domain/entities/credentials.entity';
import { ICredentialsRepository } from '../../../../domain/repositories/credentials.repository';
import { IPersonRepository } from '../../../../domain/repositories/person.repository';
import { IPersonRoleRepository } from '../../../../domain/repositories/person-role.repository';
import { ICustomerProfileRepository } from '../../../../domain/repositories/customer-profile.repository';
import { IAuthAuditRepository } from '../../../../domain/repositories/auth-audit.repository';
import { LoginDto } from '../../../dto/auth/login.dto';
import { hashPassword } from '../../../../infrastructure/auth/utils/password.util';
import { Person } from '../../../../domain/entities/person.entity';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let credentialsRepo: jest.Mocked<ICredentialsRepository>;
  let personRepo: jest.Mocked<IPersonRepository>;
  let personRoleRepo: jest.Mocked<IPersonRoleRepository>;
  let customerProfileRepo: jest.Mocked<ICustomerProfileRepository>;
  let auditRepo: jest.Mocked<IAuthAuditRepository>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  const dto: LoginDto = {
    username: 'testuser',
    password: 'SecretPass1!',
    codeCompany: 1,
  };

  const ip = '192.168.1.1';

  async function makeCredentials(
    plainPassword: string,
    overrides: Partial<{
      id: number;
      failedAttempts: number;
      accountLockedUntil: Date | null;
    }> = {},
  ): Promise<Credentials> {
    const hash = await hashPassword(plainPassword);
    return new Credentials(
      overrides.id ?? 10,
      dto.username,
      hash,
      1,
      new Date(),
      100,
      dto.codeCompany,
      overrides.failedAttempts ?? 0,
      overrides.accountLockedUntil ?? null,
    );
  }

  beforeEach(() => {
    credentialsRepo = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByUsernameAndCompany: jest.fn(),
      findByUsernameCaseInsensitive: jest.fn(),
      findPaginated: jest.fn(),
    };
    personRepo = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByIdWithRelations: jest.fn(),
      findByPersonCode: jest.fn(),
      findPaginated: jest.fn(),
    };
    personRoleRepo = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findActiveRoleName: jest.fn(),
      findActivePersonRole: jest.fn(),
      findPaginated: jest.fn(),
    };
    customerProfileRepo = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByIdForCompany: jest.fn(),
      findByCodeCustomer: jest.fn(),
      findByIdPersonRole: jest.fn(),
      findFullProfileByIdPersonRole: jest.fn(),
      findPaginated: jest.fn(),
    };
    auditRepo = {
      logLoginAttempt: jest.fn().mockResolvedValue(undefined),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt.access.token'),
    };

    useCase = new LoginUseCase(
      credentialsRepo,
      personRepo,
      personRoleRepo,
      customerProfileRepo,
      auditRepo,
      jwtService as unknown as JwtService,
    );
  });

  it('lanza UnauthorizedException si no hay credenciales para usuario y empresa', async () => {
    credentialsRepo.findByUsernameAndCompany.mockResolvedValue(null);

    await expect(useCase.execute(dto, ip)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(auditRepo.logLoginAttempt).toHaveBeenCalledWith(
      dto.username,
      dto.codeCompany,
      false,
      ip,
    );
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('lanza UnauthorizedException si la cuenta está bloqueada por tiempo', async () => {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + 10);
    const creds = await makeCredentials(dto.password, {
      accountLockedUntil: lockUntil,
    });
    credentialsRepo.findByUsernameAndCompany.mockResolvedValue(creds);

    await expect(useCase.execute(dto, ip)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(auditRepo.logLoginAttempt).toHaveBeenCalledWith(
      dto.username,
      dto.codeCompany,
      false,
      ip,
    );
    expect(credentialsRepo.update).not.toHaveBeenCalled();
  });

  it('con contraseña incorrecta incrementa intentos fallidos y audita fallo', async () => {
    const creds = await makeCredentials('OtraClave99!');
    credentialsRepo.findByUsernameAndCompany.mockResolvedValue(creds);
    credentialsRepo.update.mockImplementation(async (c) => c);

    await expect(
      useCase.execute({ ...dto, password: 'MalPassword' }, ip),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(credentialsRepo.update).toHaveBeenCalled();
    const updated = credentialsRepo.update.mock.calls[0][0] as Credentials;
    expect(updated.failedAttempts).toBe(1);
    expect(auditRepo.logLoginAttempt).toHaveBeenCalledWith(
      dto.username,
      dto.codeCompany,
      false,
      ip,
    );
  });

  it('tras 3 intentos fallidos bloquea la cuenta (accountLockedUntil)', async () => {
    const creds = await makeCredentials('OtraClave99!', { failedAttempts: 2 });
    credentialsRepo.findByUsernameAndCompany.mockResolvedValue(creds);
    credentialsRepo.update.mockImplementation(async (c) => c);

    await expect(
      useCase.execute({ ...dto, password: 'MalPassword' }, ip),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    const updated = credentialsRepo.update.mock.calls[0][0] as Credentials;
    expect(updated.failedAttempts).toBe(3);
    expect(updated.accountLockedUntil).not.toBeNull();
  });

  it('lanza UnauthorizedException si no hay rol activo para la empresa', async () => {
    const creds = await makeCredentials(dto.password);
    credentialsRepo.findByUsernameAndCompany.mockResolvedValue(creds);
    credentialsRepo.update.mockImplementation(async (c) => c);
    personRoleRepo.findActivePersonRole.mockResolvedValue(null);

    await expect(useCase.execute(dto, ip)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(auditRepo.logLoginAttempt).toHaveBeenCalledWith(
      dto.username,
      dto.codeCompany,
      false,
      ip,
    );
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('login exitoso sin rol cliente: emite JWT y no pide perfil de cliente', async () => {
    const creds = await makeCredentials(dto.password);
    credentialsRepo.findByUsernameAndCompany.mockResolvedValue(creds);
    credentialsRepo.update.mockImplementation(async (c) => c);
    personRoleRepo.findActivePersonRole.mockResolvedValue({
      idPersonRole: 55,
      roleName: 'asesor',
    });
    personRepo.findById.mockResolvedValue(
      new Person(
        100,
        1,
        'P001',
        'Nombre',
        1,
        '123',
        new Date(),
        1,
        '300',
        'a@b.com',
      ),
    );

    const result = await useCase.execute(dto, ip);

    expect(result.accessToken).toBe('jwt.access.token');
    expect(result.user.role).toBe('asesor');
    expect(result.user.userId).toBe(100);
    expect(customerProfileRepo.findFullProfileByIdPersonRole).not.toHaveBeenCalled();
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 100,
        codeCompany: dto.codeCompany,
        role: 'asesor',
        idPersonRole: 55,
      }),
      { expiresIn: 86400 },
    );
    expect(auditRepo.logLoginAttempt).toHaveBeenCalledWith(
      dto.username,
      dto.codeCompany,
      true,
      ip,
    );
  });

  it('login exitoso con rol cliente: incluye customerProfile cuando existe', async () => {
    const creds = await makeCredentials(dto.password);
    credentialsRepo.findByUsernameAndCompany.mockResolvedValue(creds);
    credentialsRepo.update.mockImplementation(async (c) => c);
    personRoleRepo.findActivePersonRole.mockResolvedValue({
      idPersonRole: 77,
      roleName: 'cliente',
    });
    personRepo.findById.mockResolvedValue(
      new Person(
        100,
        1,
        'P001',
        'Nombre',
        1,
        '123',
        new Date(),
        1,
        '300',
        'cliente@tm.com',
      ),
    );
    const profile: NonNullable<
      Awaited<
        ReturnType<ICustomerProfileRepository['findFullProfileByIdPersonRole']>
      >
    > = {
      idCustomerProfile: 1,
      codeCustomer: 'C01',
      createdAt: new Date(),
      idPersonRole: 77,
      person: {
        idPerson: 100,
        fullName: 'Nombre',
        email: 'cliente@tm.com',
        phone: '300',
        documentNumber: '123',
      },
      company: {
        codeCompany: 1,
        nameCompany: 'TM',
        prefixCompany: 'TM',
      },
      role: { idRole: 1, name: 'cliente' },
    };
    customerProfileRepo.findFullProfileByIdPersonRole.mockResolvedValue(
      profile,
    );

    const result = await useCase.execute(dto, ip);

    expect(result.user.role).toBe('cliente');
    expect(customerProfileRepo.findFullProfileByIdPersonRole).toHaveBeenCalledWith(
      77,
    );
    expect(result.customerProfile).toEqual(profile);
  });
});
