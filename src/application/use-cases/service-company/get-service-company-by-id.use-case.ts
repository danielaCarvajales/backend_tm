import { Inject, Injectable } from '@nestjs/common';
import { ServiceCompany } from '../../../domain/entities/service-company.entity';
import { IServiceCompanyRepository } from '../../../domain/repositories/service-company.repository';
import { SERVICE_COMPANY_REPOSITORY } from '../../tokens/service-company.repository.token';

@Injectable()
export class GetServiceCompanyByIdUseCase {
  constructor(
    @Inject(SERVICE_COMPANY_REPOSITORY)
    private readonly repository: IServiceCompanyRepository,
  ) {}

  async execute(
    idService: number,
    codeCompany: number,
  ): Promise<ServiceCompany | null> {
    return this.repository.findByCodeCompanyAndId(idService, codeCompany);
  }
}
