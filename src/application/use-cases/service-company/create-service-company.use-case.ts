import { Inject, Injectable } from '@nestjs/common';
import { ServiceCompany } from '../../../domain/entities/service-company.entity';
import { IServiceCompanyRepository } from '../../../domain/repositories/service-company.repository';
import { CreateServiceCompanyDto } from '../../dto/service-company/create-service-company.dto';
import { SERVICE_COMPANY_REPOSITORY } from '../../tokens/service-company.repository.token';

@Injectable()
export class CreateServiceCompanyUseCase {
  constructor(
    @Inject(SERVICE_COMPANY_REPOSITORY)
    private readonly repository: IServiceCompanyRepository,
  ) {}

  async execute(
    dto: CreateServiceCompanyDto,
    codeCompany: number,
  ): Promise<ServiceCompany> {
    const entity = new ServiceCompany(
      undefined,
      codeCompany,
      dto.name.trim(),
      dto.description.trim(),
    );
    return this.repository.save(entity);
  }
}
