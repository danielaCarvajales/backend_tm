import { Inject, Injectable } from '@nestjs/common';
import { ServiceCases } from '../../../domain/entities/service-cases.entity';
import type { ICaseRecordRepository } from '../../../domain/repositories/case-record.repository';
import { IServiceCasesRepository } from '../../../domain/repositories/service-cases.repository';
import { CreateServiceCasesDto } from '../../dto/service-cases/create-service-cases.dto';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';
import { SERVICE_COMPANY_REPOSITORY } from '../../tokens/service-company.repository.token';
import { SERVICE_CASES_REPOSITORY } from '../../tokens/service-cases.repository.token';
import type { IServiceCompanyRepository } from '../../../domain/repositories/service-company.repository';

@Injectable()
export class CreateServiceCasesUseCase {
  constructor(
    @Inject(SERVICE_CASES_REPOSITORY)
    private readonly repository: IServiceCasesRepository,
    @Inject(SERVICE_COMPANY_REPOSITORY)
    private readonly serviceCompanyRepository: IServiceCompanyRepository,
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly caseRecords: ICaseRecordRepository,
  ) {}

  async execute(
    dto: CreateServiceCasesDto,
    codeCompany: number,
  ): Promise<ServiceCases> {
    const idCase = dto.idCase;
    const caseRec = await this.caseRecords.findById(idCase);
    if (!caseRec || caseRec.codeCompany !== codeCompany) {
      throw new Error('CASE_RECORD_NOT_FOUND');
    }
    const service = await this.serviceCompanyRepository.findByCodeCompanyAndId(
      dto.idService,
      codeCompany,
    );
    if (!service) {
      throw new Error('SERVICE_COMPANY_NOT_FOUND');
    }
    const existing = await this.repository.findByCaseAndService(
      idCase,
      dto.idService,
    );
    if (existing) {
      throw new Error('SERVICE_ALREADY_IN_CASE');
    }
    const entity = new ServiceCases(
      undefined,
      idCase,
      dto.idService,
      dto.observations?.trim() ?? null,
      new Date(),
    );
    return this.repository.save(entity);
  }
}
