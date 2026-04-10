import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IdentityDocumentTypes } from "../identity-document-types/identity-document-types";
import { Nacionality } from "../nacionality/nacionality";
import { PersonRole } from "../person-role/person-role";
import { CaseRecord } from "../case-record/case-record";
import { CasePerson } from "../case-person/case-person";
import { PersonDocuments } from "../person-documents/person-documents";
import { Credentials } from "../credentials/credentials";
import { Company } from "../company/company";

@Entity("persons", { schema: "public" })
export class Person {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_person" })
    public idPerson: number;

    @Column({ type: "varchar", name: "person_code", length: 250, nullable: true, unique: true })
    public personCode: string;

    @Column({ type: "varchar", name: "full_name", length: 250, nullable: false })
    public fullName: string;

    @Column({ type: "integer", name: "code_company", nullable: false })
    public codeCompany: number;

    @Column({ type: "integer", name: "id_type_document", nullable: false })
    public idTypeDocument: number;

    @Column({ type: "varchar", name: "document_number", length: 250, nullable: false })
    public documentNumber: string;

    @Column({ type: "date", name: "birthdate", nullable: false })
    public birthdate: Date;

    @Column({ type: "integer", name: "id_nationality", nullable: false })
    public idNationality: number;

    @Column({ type: "varchar", name: "phone", length: 250, nullable: false })
    public phone: string;

    @Column({ type: "varchar", name: "email", length: 250, nullable: false })
    public email: string;

    @Column({ type: "varchar", name: "language", length: 2, nullable: false, default: "es" })
    public language: string;

    @ManyToOne(() => Company, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "code_company" }])
    public company?: Company;

    @ManyToOne(() => IdentityDocumentTypes, (idTypeDocument) => idTypeDocument.person, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })

    @JoinColumn([{ name: "id_type_document" }])
    public typeDocument?: IdentityDocumentTypes;

    @ManyToOne(() => Nacionality, (nacionality) => nacionality.person, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })

    @JoinColumn([{ name: "id_nationality" }])
    public nationality?: Nacionality;

    @OneToMany(() => PersonRole, (personRole) => personRole.person)
    public personRole?: PersonRole[];

    @OneToMany(() => CaseRecord, (caseRecord) => caseRecord.holderPerson)
    public caseRecordsHolder?: CaseRecord[];

    @OneToMany(() => CaseRecord, (caseRecord) => caseRecord.agentPerson)
    public caseRecordsAgent?: CaseRecord[];

    @OneToMany(() => CasePerson, (casePerson) => casePerson.person)
    public casePersons?: CasePerson[];

    @OneToMany(() => PersonDocuments, (document) => document.person)
    public personDocuments?: PersonDocuments[];

    @OneToMany(() => Credentials, (credentials) => credentials.person)
    public credentials?: Credentials[];

    constructor(personCode: string, fullName: string, codeCompany: number, idTypeDocument: number, documentNumber: string, birthdate: Date, phone: string, idNationality: number, email: string, language: string = "es") {
        this.personCode = personCode;
        this.fullName = fullName;
        this.codeCompany = codeCompany;
        this.idTypeDocument = idTypeDocument;
        this.documentNumber = documentNumber;
        this.birthdate = birthdate;
        this.phone = phone;
        this.idNationality = idNationality;
        this.email = email;
        this.language = language;
    }
}
