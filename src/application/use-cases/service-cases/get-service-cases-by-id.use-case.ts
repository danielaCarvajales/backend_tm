import { Inject, Injectable } from '@nestjs/common';
import {
  IServiceCasesRepository,
  ServiceCasesWithRelations,
} from '../../../domain/repositories/service-cases.repository';
import { SERVICE_CASES_REPOSITORY } from '../../tokens/service-cases.repository.token';

@Injectable()
export class GetServiceCasesByIdUseCase {
  constructor(
    @Inject(SERVICE_CASES_REPOSITORY)
    private readonly repository: IServiceCasesRepository,
  ) {}

  async execute(
    idServiceCases: number,
    idCase: number,
  ): Promise<ServiceCasesWithRelations | null> {
    return this.repository.findByCaseAndIdWithRelations(
      idCase,
      idServiceCases,
    );
  }
}
