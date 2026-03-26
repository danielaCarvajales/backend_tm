import { Inject, Injectable } from '@nestjs/common';
import { IServiceCasesRepository } from '../../../domain/repositories/service-cases.repository';
import { SERVICE_CASES_REPOSITORY } from '../../tokens/service-cases.repository.token';

@Injectable()
export class DeleteServiceCasesUseCase {
  constructor(
    @Inject(SERVICE_CASES_REPOSITORY)
    private readonly repository: IServiceCasesRepository,
  ) {}

  async execute(idServiceCases: number, idCase: number): Promise<void> {
    const existing = await this.repository.findByCaseAndId(
      idCase,
      idServiceCases,
    );
    if (!existing) {
      throw new Error('SERVICE_CASES_NOT_FOUND');
    }
    await this.repository.delete(idServiceCases);
  }
}
