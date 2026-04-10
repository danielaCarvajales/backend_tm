import { Inject, Injectable } from '@nestjs/common';
import { ServiceCases } from '../../../domain/entities/service-cases.entity';
import type { ICaseRecordRepository } from '../../../domain/repositories/case-record.repository';
import { IServiceCasesRepository } from '../../../domain/repositories/service-cases.repository';
import { UpdateServiceCasesDto } from '../../dto/service-cases/update-service-cases.dto';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';
import { SERVICE_CASES_REPOSITORY } from '../../tokens/service-cases.repository.token';

@Injectable()
export class UpdateServiceCasesUseCase {
  constructor(
    @Inject(SERVICE_CASES_REPOSITORY)
    private readonly repository: IServiceCasesRepository,
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly caseRecords: ICaseRecordRepository,
  ) {}

  async execute(
    idServiceCases: number,
    dto: UpdateServiceCasesDto,
    idCase: number,
    codeCompany: number,
  ): Promise<ServiceCases> {
    const caseRec = await this.caseRecords.findById(idCase);
    if (!caseRec || caseRec.codeCompany !== codeCompany) {
      throw new Error('CASE_RECORD_NOT_FOUND');
    }
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
