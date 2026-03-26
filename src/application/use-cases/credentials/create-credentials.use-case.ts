import { Inject, Injectable } from '@nestjs/common';
import { Credentials } from '../../../domain/entities/credentials.entity';
import { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import { CreateCredentialsDto } from '../../dto/credentials/create-credentials.dto';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';
import { hashPassword } from '../../../infrastructure/auth/utils/password.util';
import { nowColombia } from '../../../infrastructure/utils/date.util';

@Injectable()
export class CreateCredentialsUseCase {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly repository: ICredentialsRepository,
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
    return this.repository.save(entity);
  }
}
