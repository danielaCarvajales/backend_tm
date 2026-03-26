import { Inject, Injectable } from '@nestjs/common';
import { ServiceCompany } from '../../../domain/entities/service-company.entity';
import { IServiceCompanyRepository } from '../../../domain/repositories/service-company.repository';
import { UpdateServiceCompanyDto } from '../../dto/service-company/update-service-company.dto';
import { SERVICE_COMPANY_REPOSITORY } from '../../tokens/service-company.repository.token';

@Injectable()
export class UpdateServiceCompanyUseCase {
  constructor(
    @Inject(SERVICE_COMPANY_REPOSITORY)
    private readonly repository: IServiceCompanyRepository,
  ) {}

  async execute(
    idService: number,
    dto: UpdateServiceCompanyDto,
    codeCompany: number,
  ): Promise<ServiceCompany> {
    const existing = await this.repository.findByCodeCompanyAndId(
      idService,
      codeCompany,
    );
    if (!existing) {
      throw new Error('SERVICE_COMPANY_NOT_FOUND');
    }
    const updated = new ServiceCompany(
      idService,
      codeCompany,
      dto.name?.trim() ?? existing.name,
      dto.description?.trim() ?? existing.description,
    );
    return this.repository.update(updated);
  }
}
