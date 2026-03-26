import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "../company/company";
import { StateCase } from "../state-case/state-case";
import { Person } from "../person/person";
import { ServiceCases } from "../service-cases/service-cases";
import { CasePerson } from "../case-person/case-person";
import { CaseDocument } from "../case-document/case-document";
import { Contract } from "../contract/contract";

@Entity("cases_records", { schema: "public" })
export class CaseRecord {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_case" })
    public idCase: number;

    @Column({ type: "varchar", name: "case_code", length: 55, nullable: false })
    public caseCode: string;

    @Column({ type: "integer", name: "holder", nullable: false })
    public holder: number;

    @Column({ type: "integer", name: "agent", nullable: true })
    public agent: number | null;

    @Column({ type: "integer", name: "code_company", nullable: false })
    public codeCompany: number;

    @Column({ type: "integer", name: "id_state_case", nullable: false })
    public idStateCase: number;

    @Column({ type: "datetime", name: "created_at", nullable: false })
    public createdAt: Date;

    @Column({ type: "datetime", name: "closing_date", nullable: true })
    public closingDate: Date | null;

    @ManyToOne(() => Person, (person) => person.caseRecordsHolder, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "holder" }])
    public holderPerson?: Person;

    @ManyToOne(() => Person, (person) => person.caseRecordsAgent, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "agent" }])
    public agentPerson?: Person;

    @ManyToOne(() => Company, (company) => company.caseRecords, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "code_company" }])
    public company?: Company;

    @ManyToOne(() => StateCase, (stateCase) => stateCase.casesRecords, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "id_state_case" }])
    public stateCase?: StateCase;

    @OneToMany(() => ServiceCases, (serviceCases) => serviceCases.caseRecord)
    public serviceCases?: ServiceCases[];

    @OneToMany(() => CasePerson, (casePerson) => casePerson.caseRecord)
    public casePersons?: CasePerson[];

    @OneToMany(() => CaseDocument, (caseDocument) => caseDocument.caseRecord)
    public caseDocuments?: CaseDocument[];

    @OneToMany(() => Contract, (contract) => contract.caseRecord)
    public contracts?: Contract[];

    constructor(idCase: number, caseCode: string, holder: number, agent: number | null, codeCompany: number, idStateCase: number, createdAt: Date, closingDate: Date | null) {
        this.idCase = idCase;
        this.caseCode = caseCode;
        this.holder = holder;
        this.agent = agent;
        this.codeCompany = codeCompany;
        this.idStateCase = idStateCase;
        this.createdAt = createdAt;
        this.closingDate = closingDate;
    }
}
