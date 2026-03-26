import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthAuditLog } from '../infrastructure/persistence/typeorm/entities/auth-audit-log/auth-audit-log';
import { CaseDocument } from '../infrastructure/persistence/typeorm/entities/case-document/case-document';
import { CasePerson } from '../infrastructure/persistence/typeorm/entities/case-person/case-person';
import { CaseRecord } from '../infrastructure/persistence/typeorm/entities/case-record/case-record';
import { Company } from '../infrastructure/persistence/typeorm/entities/company/company';
import { Contract } from '../infrastructure/persistence/typeorm/entities/contract/contract';
import { Credentials } from '../infrastructure/persistence/typeorm/entities/credentials/credentials';
import { CustomerProfile } from '../infrastructure/persistence/typeorm/entities/customer-profile/customer-profile';
import { Document } from '../infrastructure/persistence/typeorm/entities/document/document';
import { FamilyRelationship } from '../infrastructure/persistence/typeorm/entities/family-relationship/family-relationship';
import { IdentityDocumentTypes } from '../infrastructure/persistence/typeorm/entities/identity-document-types/identity-document-types';
import { Nacionality } from '../infrastructure/persistence/typeorm/entities/nacionality/nacionality';
import { PaymentPlan } from '../infrastructure/persistence/typeorm/entities/payment-plan/payment-plan';
import { Payment } from '../infrastructure/persistence/typeorm/entities/payment/payment';
import { PersonDocuments } from '../infrastructure/persistence/typeorm/entities/person-documents/person-documents';
import { PersonRole } from '../infrastructure/persistence/typeorm/entities/person-role/person-role';
import { Person } from '../infrastructure/persistence/typeorm/entities/person/person';
import { Role } from '../infrastructure/persistence/typeorm/entities/role/role';
import { ServiceCases } from '../infrastructure/persistence/typeorm/entities/service-cases/service-cases';
import { ServiceCompany } from '../infrastructure/persistence/typeorm/entities/service-company/service-company';
import { StateCase } from '../infrastructure/persistence/typeorm/entities/state-case/state-case';
import { State } from '../infrastructure/persistence/typeorm/entities/state/state';
import { TypeDocument } from '../infrastructure/persistence/typeorm/entities/type_document/type_document';

config({ path: '.env' });

const ROLES = ['administrador', 'asesor', 'cliente'] as const;

const STATE_CASES = [
  'RADICADO',
  'EVIDENCIA_SOLICITADA',
  'ENTREVISTA_PROGRAMADA',
  'APROBADO',
  'DENEGADO',
  'GENERACION_CONTRATO',
  'FINALIZADO',
] as const;

const FAMILY_RELATIONSHIPS = [
  'Cónyuges',
  'Hijos menores de edad',
  'Padres',
  'Hijos mayores de edad',
  'Hermanos',
] as const;

async function runSeed() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'backend_tm',
    synchronize: false,
    logging: false,
    namingStrategy: new SnakeNamingStrategy(),
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
    ],
  });

  await dataSource.initialize();
  const roleRepo = dataSource.getRepository(Role);
  const personRoleRepo = dataSource.getRepository(PersonRole);
  const stateCaseRepo = dataSource.getRepository(StateCase);
  const familyRelationshipRepo = dataSource.getRepository(FamilyRelationship);

  try {
    for (const stateCaseName of STATE_CASES) {
      const existing = await stateCaseRepo.findOne({
        where: { nameState: stateCaseName },
      });
      if (!existing) {
        await stateCaseRepo.save({ nameState: stateCaseName });
        console.log(`✓ Estado de caso creado: ${stateCaseName}`);
      } else {
        console.log(
          `- Estado de caso ya existe: ${stateCaseName} (id: ${existing.idState})`,
        );
      }
    }

    for (const relName of FAMILY_RELATIONSHIPS) {
      const existing = await familyRelationshipRepo.findOne({
        where: { nameFamilyRelationship: relName },
      });
      if (!existing) {
        await familyRelationshipRepo.save({
          nameFamilyRelationship: relName,
        });
        console.log(`✓ Relación familiar creada: ${relName}`);
      } else {
        console.log(
          `- Relación familiar ya existe: ${relName} (id: ${existing.idFamilyRelationship})`,
        );
      }
    }

    for (const roleName of ROLES) {
      const existing = await roleRepo.findOne({ where: { name: roleName } });
      if (!existing) {
        await roleRepo.save({ name: roleName });
        console.log(`✓ Rol creado: ${roleName}`);
      } else {
        console.log(`- Rol ya existe: ${roleName} (id: ${existing.idRole})`);
      }
    }

    // 2. Optional: assign role to person for company
    const args = process.argv.slice(2);
    const personArg = args.find((a) => a.startsWith('--person='));
    const companyArg = args.find((a) => a.startsWith('--company='));
    const roleArg = args.find((a) => a.startsWith('--role='));

    if (personArg && companyArg && roleArg) {
      const idPerson = parseInt(personArg.split('=')[1], 10);
      const codeCompany = parseInt(companyArg.split('=')[1], 10);
      const roleName = roleArg.split('=')[1].toLowerCase().trim();

      if (!ROLES.some((r) => r.toLowerCase() === roleName)) {
        console.error(`Rol inválido. Use: ${ROLES.join(', ')}`);
        process.exit(1);
      }

      const role = await roleRepo.findOne({
        where: { name: ROLES.find((r) => r.toLowerCase() === roleName) ?? roleName },
      });
      if (!role) {
        console.error(`Rol ${roleName} no encontrado en la base de datos`);
        process.exit(1);
      }

      const existing = await personRoleRepo.findOne({
        where: {
          idPerson,
          codeCompany,
          idRole: role.idRole,
        },
      });

      if (existing) {
        console.log(
          `- PersonRole ya existe: persona ${idPerson}, empresa ${codeCompany}, rol ${roleName}`,
        );
      } else {
        await personRoleRepo.save({
          idPerson,
          idRole: role.idRole,
          codeCompany,
          idState: 1,
          assignmentDate: new Date(),
        });
        console.log(
          `✓ PersonRole creado: persona ${idPerson}, empresa ${codeCompany}, rol ${roleName}`,
        );
      }
    } else if (personArg || companyArg || roleArg) {
      console.log(
        'Para asignar rol use los 3 parámetros: --person=ID --company=ID --role=administrador',
      );
    }

    console.log('\nSeed completado.');
  } finally {
    await dataSource.destroy();
  }
}

runSeed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
