import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CaseRecord } from "../case-record/case-record";
import { Payment } from "../payment/payment";

@Entity('contracts', { schema: 'public' })
export class Contract {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_contract" })
    public idContract: number;

    @Column({ type: "varchar", name: "contract_code", length: 100, nullable: false })
    public contractCode: string;

    @Column({ type: "integer", name: "id_case", nullable: false })
    public idCase: number;

    @Column({ type: "varchar", name: "digital_signature", length: 250, nullable: true })
    public digitalSignature: string;

    @Column({ type: "timestamp", name: "created_at", nullable: false })
    public createdAt: Date;

    @ManyToOne(() => CaseRecord, (caseRecord) => caseRecord.contracts, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "id_case" }])
    public caseRecord?: CaseRecord;

    @OneToMany(() => Payment, (payment) => payment.contract)
    public payments?: Payment[];

    constructor(idContract: number, contractCode: string, idCase: number, digitalSignature: string, createdAt: Date) {
        this.idContract = idContract;
        this.contractCode = contractCode;
        this.idCase = idCase;
        this.digitalSignature = digitalSignature;
        this.createdAt = createdAt;
    }
}
