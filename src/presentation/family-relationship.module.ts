import { Module } from '@nestjs/common';
import { FAMILY_RELATIONSHIP_REPOSITORY } from '../application/tokens/family-relationship.repository.token';
import { CreateFamilyRelationshipUseCase } from '../application/use-cases/family-relationship/create-family-relationship.use-case';
import { DeleteFamilyRelationshipUseCase } from '../application/use-cases/family-relationship/delete-family-relationship.use-case';
import { GetFamilyRelationshipByIdUseCase } from '../application/use-cases/family-relationship/get-family-relationship-by-id.use-case';
import { ListFamilyRelationshipsUseCase } from '../application/use-cases/family-relationship/list-family-relationships.use-case';
import { UpdateFamilyRelationshipUseCase } from '../application/use-cases/family-relationship/update-family-relationship.use-case';
import { FamilyRelationshipController } from './controllers/family-relationship.controller';
import { FamilyRelationshipTypeOrmRepository } from '../infrastructure/persistence/typeorm/repositories/family-relationship.repository';

@Module({
  controllers: [FamilyRelationshipController],
  providers: [
    {
      provide: FAMILY_RELATIONSHIP_REPOSITORY,
      useClass: FamilyRelationshipTypeOrmRepository,
    },
    CreateFamilyRelationshipUseCase,
    UpdateFamilyRelationshipUseCase,
    DeleteFamilyRelationshipUseCase,
    GetFamilyRelationshipByIdUseCase,
    ListFamilyRelationshipsUseCase,
  ],
  exports: [FAMILY_RELATIONSHIP_REPOSITORY],
})
export class FamilyRelationshipModule {}
