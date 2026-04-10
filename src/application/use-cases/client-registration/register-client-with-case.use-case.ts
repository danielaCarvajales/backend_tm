import { Inject, Injectable } from '@nestjs/common';
import { CaseRecord } from '../../../domain/entities/case-record.entity';
import { CustomerProfile } from '../../../domain/entities/customer-profile.entity';
import { Credentials } from '../../../domain/entities/credentials.entity';
import { Person } from '../../../domain/entities/person.entity';
import { PersonRole } from '../../../domain/entities/person-role.entity';
import { IRoleRepository } from '../../../domain/repositories/role.repository';
import { AuthContext } from '../../auth/auth-context';
import { RegisterClientWithCaseDto } from '../../dto/client-registration/register-client-with-case.dto';
import { ROLE_REPOSITORY } from '../../tokens/role.repository.token';
import { CreateCaseRecordUseCase } from '../case-record/create-case-record.use-case';
import { CreateCredentialsUseCase } from '../credentials/create-credentials.use-case';
import { CreateCustomerProfileUseCase } from '../customer-profile/create-customer-profile.use-case';
import { CreatePersonUseCase } from '../person/create-person.use-case';
import { CreatePersonRoleUseCase } from '../person-role/create-person-role.use-case';

const CLIENT_ROLE_NAME = 'cliente';

export interface RegisterClientWithCaseResult {
  person: Person;
  personRole: PersonRole;
  credentials: Credentials;
  customerProfile: CustomerProfile;
  caseRecord: CaseRecord;
}

@Injectable()
export class RegisterClientWithCaseUseCase {
  constructor(
    private readonly createPerson: CreatePersonUseCase,
    private readonly createPersonRole: CreatePersonRoleUseCase,
    private readonly createCredentials: CreateCredentialsUseCase,
    private readonly createCustomerProfile: CreateCustomerProfileUseCase,
    private readonly createCaseRecord: CreateCaseRecordUseCase,
    @Inject(ROLE_REPOSITORY)
    private readonly roles: IRoleRepository,
  ) {}

  async execute(
    dto: RegisterClientWithCaseDto,
    authContext: AuthContext,
  ): Promise<RegisterClientWithCaseResult> {
    const person = await this.createPerson.execute(dto.person, authContext);
    const idPerson = person.idPerson;
    if (idPerson == null) {
      throw new Error('PERSON_SAVE_FAILED');
    }

    const clientRole = await this.roles.findByName(CLIENT_ROLE_NAME);
    if (!clientRole?.idRole) {
      throw new Error('CLIENT_ROLE_NOT_FOUND');
    }

    const personRole = await this.createPersonRole.execute(
      { idPerson, idRole: clientRole.idRole },
      authContext,
    );
    const idPersonRole = personRole.idPersonRole;
    if (idPersonRole == null) {
      throw new Error('PERSON_ROLE_SAVE_FAILED');
    }

    const credentials = await this.createCredentials.execute(
      {
        username: dto.username,
        password: dto.password,
        idPerson,
        state: 1,
      },
      authContext,
    );

    const customerProfile = await this.createCustomerProfile.execute(
      { idPersonRole },
      authContext,
    );

    const caseRecord = await this.createCaseRecord.execute(
      { amount: dto.amount, serviceIds: dto.serviceIds ?? null },
      {
        holder: idPerson,
        codeCompany: authContext.companyId,
        agentPersonId: authContext.userId,
      },
    );

    return {
      person,
      personRole,
      credentials,
      customerProfile,
      caseRecord,
    };
  }
}
