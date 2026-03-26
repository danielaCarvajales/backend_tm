import { Inject, Injectable } from '@nestjs/common';
import { ServiceCases } from '../../../domain/entities/service-cases.entity';
import { IServiceCasesRepository } from '../../../domain/repositories/service-cases.repository';
import { UpdateServiceCasesDto } from '../../dto/service-cases/update-service-cases.dto';
import { SERVICE_CASES_REPOSITORY } from '../../tokens/service-cases.repository.token';

@Injectable()
export class UpdateServiceCasesUseCase {
  constructor(
    @Inject(SERVICE_CASES_REPOSITORY)
    private readonly repository: IServiceCasesRepository,
  ) {}

  async execute(
    idServiceCases: number,
    dto: UpdateServiceCasesDto,
    idCase: number,
  ): Promise<ServiceCases> {
    const existing = await this.repository.findByCaseAndId(
      idCase,
      idServiceCases,
    );
    if (!existing) {
      throw new Error('SERVICE_CASES_NOT_FOUND');
    }
    const updated = new ServiceCases(
      idServiceCases,
      idCase,
      existing.idServices,
      dto.observations !== undefined ? dto.observations.trim() ?? null : existing.observation,
      existing.createdAt,
    );
    return this.repository.update(updated);
  }
}
