import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "../company/company";
import { ServiceCases } from "../service-cases/service-cases";

@Entity('company_services', { schema: 'public' })
export class ServiceCompany {
    @PrimaryGeneratedColumn({ type: "integer", name: "id_service" })
    public idServices: number;

    @Column({ type: 'integer', name: 'code_company', nullable: false })
    public codeCompany: number;

    @Column({ type: 'varchar', name: 'name', length: 255, nullable: false })
    public name: string;

    @Column({ type: 'text', name: 'description', nullable: false })
    public description: string

    @ManyToOne(() => Company, (company) => company.servicesCompany, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",

    })
    @JoinColumn([{ name: "code_company" }])
    public companies?: Company;

    @OneToMany(() => ServiceCases, (serviceCases) => serviceCases.serviceCompany)
    public serviceCases?: ServiceCases[];


    constructor(idServices: number, codeCompany: number, name: string, description: string) {
        this.idServices = idServices;
        this.codeCompany = codeCompany;
        this.name = name;
        this.description = description;
    }
}
