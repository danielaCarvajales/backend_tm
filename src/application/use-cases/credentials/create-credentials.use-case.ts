import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Credentials } from '../../../domain/entities/credentials.entity';
import type { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import type { IPersonRepository } from '../../../domain/repositories/person.repository';
import { CreateCredentialsDto } from '../../dto/credentials/create-credentials.dto';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';
import { PERSON_REPOSITORY } from '../../tokens/person.repository.token';
import { hashPassword } from '../../../infrastructure/auth/utils/password.util';
import { nowColombia } from '../../../infrastructure/utils/date.util';
import { SendWelcomeEmailUseCase } from '../email/send-welcome-email.use-case';
import { AuthContext, ensureCanManageCompanyUsers } from '../../auth/auth-context';

@Injectable()
export class CreateCredentialsUseCase {
  private readonly logger = new Logger(CreateCredentialsUseCase.name);

  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly repository: ICredentialsRepository,
    @Inject(PERSON_REPOSITORY)
    private readonly persons: IPersonRepository,
    private readonly sendWelcomeEmail: SendWelcomeEmailUseCase,
    private readonly config: ConfigService,
  ) {}

  async execute(dto: CreateCredentialsDto, authContext: AuthContext): Promise<Credentials> {
    ensureCanManageCompanyUsers(authContext);
    const codeCompany = authContext.companyId;
    const person = await this.persons.findById(dto.idPerson, codeCompany);
    if (!person) {
      throw new Error('PERSON_NOT_FOUND');
    }
    const hashedPassword = await hashPassword(dto.password);
    const entity = new Credentials(
      undefined,
      dto.username,
      hashedPassword,
      dto.state ?? 1,
      nowColombia(),
      dto.idPerson,
      codeCompany,
      0,
      null,
    );
    const saved = await this.repository.save(entity);
    await this.trySendWelcomeEmail(
      dto,
      person.fullName,
      person.email,
      person.language,
    );
    return saved;
  }

  // No bloquea el registro si el correo falla (SMTP, etc.).
  private async trySendWelcomeEmail(
    dto: CreateCredentialsDto,
    personName: string,
    personEmail: string,
    personLanguage: string,
  ): Promise<void> {
    try {
      const to = personEmail?.trim();
      if (!to) {
        this.logger.warn(
          `Correo de bienvenida omitido: la persona ${dto.idPerson} no tiene email`,
        );
        return;
      }
      const name = personName?.trim() || 'Usuario';
      const dashboardLink = this.config
        .get<string>('EMAIL_WELCOME_DASHBOARD_URL')
        ?.trim();
      await this.sendWelcomeEmail.execute({
        to,
        name,
        language: personLanguage ?? 'es',
        dashboardLink: dashboardLink || undefined,
        username: dto.username,
        plainPassword: dto.password,
      });
    } catch (err) {
      this.logger.warn(
        `No se pudo enviar el correo de bienvenida: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
