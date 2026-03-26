import { Inject, Injectable } from '@nestjs/common';
import { ICredentialsRepository } from '../../../domain/repositories/credentials.repository';
import { CREDENTIALS_REPOSITORY } from '../../tokens/credentials.repository.token';

@Injectable()
export class DeleteCredentialsUseCase {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly repository: ICredentialsRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('CREDENTIALS_NOT_FOUND');
    }
    await this.repository.delete(id);
  }
}
