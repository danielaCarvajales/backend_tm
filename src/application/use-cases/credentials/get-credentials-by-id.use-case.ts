import { Inject, Injectable } from '@nestjs/common';
import { Credentials } from '../../../domain/entities/credentials.entity';
import { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';

@Injectable()
export class GetCredentialsByIdUseCase {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly repository: ICredentialsRepository,
  ) {}

  async execute(id: number): Promise<Credentials | null> {
    return this.repository.findById(id);
  }
}
