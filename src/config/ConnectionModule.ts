import { Global, Module } from '@nestjs/common';
import { AuthAuditLog } from 'src/infrastructure/persistence/typeorm/entities/auth-audit-log/auth-audit-log';
import { CaseDocument } from 'src/infrastructure/persistence/typeorm/entities/case-document/case-document';
import { CasePerson } from 'src/infrastructure/persistence/typeorm/entities/case-person/case-person';
import { CaseRecord } from 'src/infrastructure/persistence/typeorm/entities/case-record/case-record';
import { Company } from 'src/infrastructure/persistence/typeorm/entities/company/company';
import { Contract } from 'src/infrastructure/persistence/typeorm/entities/contract/contract';
import { Credentials } from 'src/infrastructure/persistence/typeorm/entities/credentials/credentials';
import { CustomerProfile } from 'src/infrastructure/persistence/typeorm/entities/customer-profile/customer-profile';
import { Document } from 'src/infrastructure/persistence/typeorm/entities/document/document';
import { FamilyRelationship } from 'src/infrastructure/persistence/typeorm/entities/family-relationship/family-relationship';
import { IdentityDocumentTypes } from 'src/infrastructure/persistence/typeorm/entities/identity-document-types/identity-document-types';
import { Nacionality } from 'src/infrastructure/persistence/typeorm/entities/nacionality/nacionality';
import { PaymentPlan } from 'src/infrastructure/persistence/typeorm/entities/payment-plan/payment-plan';
import { Payment } from 'src/infrastructure/persistence/typeorm/entities/payment/payment';
import { PersonDocuments } from 'src/infrastructure/persistence/typeorm/entities/person-documents/person-documents';
import { PersonRole } from 'src/infrastructure/persistence/typeorm/entities/person-role/person-role';
import { Person } from 'src/infrastructure/persistence/typeorm/entities/person/person';
import { Role } from 'src/infrastructure/persistence/typeorm/entities/role/role';
import { ServiceCases } from 'src/infrastructure/persistence/typeorm/entities/service-cases/service-cases';
import { ServiceCompany } from 'src/infrastructure/persistence/typeorm/entities/service-company/service-company';
import { StateCase } from 'src/infrastructure/persistence/typeorm/entities/state-case/state-case';
import { State } from 'src/infrastructure/persistence/typeorm/entities/state/state';
import { TypeDocument } from 'src/infrastructure/persistence/typeorm/entities/type_document/type_document';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Global()
@Module({
    imports: [],
    providers: [
        {
            provide: DataSource,
            inject: [],
            useFactory: async () => {
                try {
                    const poolConnection = new DataSource({
                        type: "mysql",
                        host: String(process.env.DB_HOST),
                        port: Number(process.env.DB_PORT),
                        username: String(process.env.DB_USER),
                        password: String(process.env.DB_PASSWORD),
                        database: String(process.env.DB_NAME),
                        synchronize: true, //Se sincroniza en la bd
                        logging: false, //Ocuta la información de la bd
                        namingStrategy: new SnakeNamingStrategy(), /* Con esta libreria se  convierte el primero en mayuscula al usarlo */
                        entities: [
                            AuthAuditLog,
                            State,
                            Company,
                            IdentityDocumentTypes,
                            Nacionality,
                            Person,
                            Credentials,
                            CustomerProfile,
                            Role,
                            PersonRole,
                            ServiceCompany,
                            StateCase,
                            CaseRecord,
                            ServiceCases,
                            FamilyRelationship,
                            CasePerson,
                            TypeDocument,
                            Document,
                            PersonDocuments,
                            CaseDocument,
                            Contract,
                            PaymentPlan,
                            Payment,

                        ]
                    });
                    await poolConnection.initialize();
                    console.log('Connection estableced with: ' + String(process.env.DB_NAME));
                    return poolConnection;
                } catch (myError) {
                    console.log("Fail the connection of the data base ");
                    throw myError
                }
            }
        }
    ],
    exports: [DataSource],
})
export class ConnectionModule { }
