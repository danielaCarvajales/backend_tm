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

  async execute(dto: CreateCredentialsDto): Promise<Credentials> {
    const hashedPassword = await hashPassword(dto.password);
    const entity = new Credentials(
      undefined,
      dto.username,
      hashedPassword,
      dto.state ?? 1,
      nowColombia(),
      dto.idPerson,
      dto.codeCompany,
      0,
      null,
    );
    const saved = await this.repository.save(entity);
    await this.trySendWelcomeEmail(dto);
    return saved;
  }

  // No bloquea el registro si el correo falla (SMTP, etc.).
  private async trySendWelcomeEmail(dto: CreateCredentialsDto): Promise<void> {
    try {
      const person = await this.persons.findById(dto.idPerson);
      if (!person) {
        this.logger.warn(
          `Correo de bienvenida omitido: no existe la persona ${dto.idPerson}`,
        );
        return;
      }
      const to = person.email?.trim();
      if (!to) {
        this.logger.warn(
          `Correo de bienvenida omitido: la persona ${dto.idPerson} no tiene email`,
        );
        return;
      }
      const name = person.fullName?.trim() || 'Usuario';
      const dashboardLink = this.config
        .get<string>('EMAIL_WELCOME_DASHBOARD_URL')
        ?.trim();
      await this.sendWelcomeEmail.execute({
        to,
        name,
        dashboardLink: dashboardLink || undefined,
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
