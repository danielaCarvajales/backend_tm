import { Inject, Injectable } from '@nestjs/common';
import { IdentityDocumentType } from '../../../domain/entities/identity-document-type.entity';
import {
  IIdentityDocumentTypeRepository,
} from '../../../domain/repositories/identity-document-type.repository';
import { CreateIdentityDocumentTypeDto } from '../../dto/identity-document-type/create-identity-document-type.dto';
import { IDENTITY_DOCUMENT_TYPE_REPOSITORY } from '../../tokens/identity-document-type.repository.token';

@Injectable()
export class CreateIdentityDocumentTypeUseCase {
  constructor(
    @Inject(IDENTITY_DOCUMENT_TYPE_REPOSITORY)
    private readonly repository: IIdentityDocumentTypeRepository,
  ) {}

  async execute(dto: CreateIdentityDocumentTypeDto): Promise<IdentityDocumentType> {
    const entity = new IdentityDocumentType(
      undefined,
      dto.name,
      dto.abbreviation,
    );
    return this.repository.save(entity);
  }
}
