import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { State } from "../state/state";
import { PersonRole } from "../person-role/person-role";
import { ServiceCompany } from "../service-company/service-company";
import { CaseRecord } from "../case-record/case-record";
import { Credentials } from "../credentials/credentials";

@Entity("companies", { schema: "public" })
export class Company {

    @PrimaryGeneratedColumn({ type: "integer", name: "code_company" })
    public codeCompany: number;

    @Column({ type: "varchar", name: "name_company", length: 250, nullable: false })
    public nameCompany: string;

    @Column({ type: "varchar", name: "prefix_company", length: 250, nullable: false })
    public prefixCompany: string;

    @Column({ type: "integer", name: "state_company", nullable: false, default: 1 })
    public stateCompany: number;

    @ManyToOne(() => State, (state) => state.companies, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",

    })
    @JoinColumn([{ name: "state_company" }])
    public state?: State;

    @OneToMany(() => PersonRole, (personRole) => personRole.company)
    public personRole?: PersonRole;

    @OneToMany(() => ServiceCompany, (serviceCompany) => serviceCompany.companies)
    public servicesCompany?: ServiceCompany;

    @OneToMany(() => CaseRecord, (caseRecord) => caseRecord.company)
    public caseRecords?: CaseRecord[];

    @OneToMany(() => Credentials, (credentials) => credentials.company)
    public credentials?: Credentials[];

    constructor(codeCompany: number, nameCompany: string, prefixCompany: string, stateCompany: number) {
        this.codeCompany = codeCompany;
        this.nameCompany = nameCompany;
        this.prefixCompany = prefixCompany;
        this.stateCompany = stateCompany;
    }
}
