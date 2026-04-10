import { Inject, Injectable } from '@nestjs/common';
import { CaseRecord } from '../../../domain/entities/case-record.entity';
import { Person } from '../../../domain/entities/person.entity';
import { PersonRole } from '../../../domain/entities/person-role.entity';
import type { IRoleRepository } from '../../../domain/repositories/role.repository';
import { AuthContext } from '../../auth/auth-context';
import { CreateClientOnboardingDto } from '../../dto/client-onboarding/create-client-onboarding.dto';
import { ROLE_REPOSITORY } from '../../tokens/role.repository.token';
import { CreateCaseRecordUseCase } from '../case-record/create-case-record.use-case';
import { CreateCredentialsUseCase } from '../credentials/create-credentials.use-case';
import { CreateCustomerProfileUseCase } from '../customer-profile/create-customer-profile.use-case';
import { CreatePersonRoleUseCase } from '../person-role/create-person-role.use-case';
import { CreatePersonUseCase } from '../person/create-person.use-case';

export interface CreateClientOnboardingResult {
  person: Person;
  personRole: PersonRole;
  caseRecord: CaseRecord;
}

@Injectable()
export class CreateClientOnboardingUseCase {
  constructor(
    private readonly createPerson: CreatePersonUseCase,
    @Inject(ROLE_REPOSITORY)
    private readonly roles: IRoleRepository,
    private readonly createPersonRole: CreatePersonRoleUseCase,
    private readonly createCredentials: CreateCredentialsUseCase,
    private readonly createCustomerProfile: CreateCustomerProfileUseCase,
    private readonly createCaseRecord: CreateCaseRecordUseCase,
  ) {}

  async execute(
    dto: CreateClientOnboardingDto,
    authContext: AuthContext,
  ): Promise<CreateClientOnboardingResult> {
    const person = await this.createPerson.execute(dto.person, authContext);
    if (person.idPerson == null) {
      throw new Error('PERSON_SAVE_FAILED');
    }
    const idClienteRole = await this.resolveClienteRoleId();
    const personRole = await this.createPersonRole.execute(
      {
        idPerson: person.idPerson,
        idRole: idClienteRole,
        idState: 1,
      },
      authContext,
    );
    if (personRole.idPersonRole == null) {
      throw new Error('PERSON_ROLE_SAVE_FAILED');
    }
    await this.createCredentials.execute(
      {
        username: dto.credentials.username,
        password: dto.credentials.password,
        idPerson: person.idPerson,
      },
      authContext,
    );
    await this.createCustomerProfile.execute(
      { idPersonRole: personRole.idPersonRole },
      authContext,
    );
    const amountStr =
      typeof dto.case.amount === 'number'
        ? dto.case.amount.toFixed(2)
        : String(dto.case.amount);
    const caseRecord = await this.createCaseRecord.execute(
      { amount: amountStr, serviceIds: dto.case.serviceIds ?? null },
      {
        holder: person.idPerson,
        codeCompany: authContext.companyId,
        agentPersonId: authContext.userId,
      },
    );
    return { person, personRole, caseRecord };
  }

  private async resolveClienteRoleId(): Promise<number> {
    const candidates = ['cliente', 'Cliente', 'CLIENTE'];
    for (const name of candidates) {
      const role = await this.roles.findByName(name);
      if (role?.idRole != null) {
        return role.idRole;
      }
    }
    throw new Error('CLIENTE_ROLE_NOT_FOUND');
  }
}
