import { Inject, Injectable } from '@nestjs/common';
import { IServiceCompanyRepository } from '../../../domain/repositories/service-company.repository';
import { SERVICE_COMPANY_REPOSITORY } from '../../tokens/service-company.repository.token';

@Injectable()
export class DeleteServiceCompanyUseCase {
  constructor(
    @Inject(SERVICE_COMPANY_REPOSITORY)
    private readonly repository: IServiceCompanyRepository,
  ) {}

  async execute(idService: number, codeCompany: number): Promise<void> {
    const existing = await this.repository.findByCodeCompanyAndId(
      idService,
      codeCompany,
    );
    if (!existing) {
      throw new Error('SERVICE_COMPANY_NOT_FOUND');
    }
    await this.repository.delete(idService);
  }
}
