import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CaseRecord } from "../case-record/case-record";
import { ServiceCompany } from "../service-company/service-company";

@Entity("services_cases", { schema: "public" })
export class ServiceCases {
    @PrimaryGeneratedColumn({ type: "integer", name: "id_service_cases" })
    public idServiceCases: number;

    @Column("integer", { name: "id_case", nullable: false })
    public idCase: number;

    @Column("integer", { name: "id_services", nullable: false })
    public idServices: number;

    @Column("text", { name: "observation", nullable: true })
    public observation: string;

    @Column("timestamp", { name: "created_at", nullable: false })
    public createdAt: Date;

    @ManyToOne(() => CaseRecord, (caseRecord) => caseRecord.serviceCases, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })

    @JoinColumn([{ name: "id_case" }])
    public caseRecord?: CaseRecord;

    @ManyToOne(() => ServiceCompany, (serviceCompany) => serviceCompany.serviceCases, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })

    @JoinColumn([{ name: "id_services" }])
    public serviceCompany?: ServiceCompany;

    constructor(idCase: number, idServices: number, observation: string) {
        this.idCase = idCase;
        this.idServices = idServices;
        this.observation = observation;
    }
}
