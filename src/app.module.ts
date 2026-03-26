import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ConnectionModule } from './config/ConnectionModule';
import { AuthModule } from './presentation/auth.module';
import { CaseRecordModule } from './presentation/case-record.module';
import { JwtAuthGuard } from './infrastructure/auth/guards/jwt-auth.guard';
import { CompanyModule } from './presentation/company.module';
import { CredentialsModule } from './presentation/credentials.module';
import { CustomerProfileModule } from './presentation/customer-profile.module';
import { IdentityDocumentTypeModule } from './presentation/identity-document-type.module';
import { NationalityModule } from './presentation/nationality.module';
import { PersonModule } from './presentation/person.module';
import { PersonRoleModule } from './presentation/person-role.module';
import { RoleModule } from './presentation/role.module';
import { ServiceCasesModule } from './presentation/service-cases.module';
import { ServiceCompanyModule } from './presentation/service-company.module';
import { StateCaseModule } from './presentation/state-case.module';
import { StateModule } from './presentation/state.module';
import { FamilyRelationshipModule } from './presentation/family-relationship.module';
import { CasePersonModule } from './presentation/case-person.module';
import { TypeDocumentModule } from './presentation/type-document.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ConnectionModule,
    AuthModule,
    CaseRecordModule,
    CompanyModule,
    CredentialsModule,
    CustomerProfileModule,
    IdentityDocumentTypeModule,
    NationalityModule,
    PersonModule,
    PersonRoleModule,
    RoleModule,
    ServiceCasesModule,
    ServiceCompanyModule,
    StateCaseModule,
    StateModule,
    FamilyRelationshipModule,
    CasePersonModule,
    TypeDocumentModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
