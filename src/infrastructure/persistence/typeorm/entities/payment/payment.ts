import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PaymentPlan } from "../payment-plan/payment-plan";
import { Contract } from "../contract/contract";
import { Document } from "../document/document";

@Entity('payments', { schema: 'public' })
export class Payment {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_payment" })
    public idPayment: number;

    @Column({ type: "integer", name: "id_payment_plan", nullable: false })
    public idPaymentPlan: number;

    @Column({ type: "integer", name: "id_contract", nullable: true })
    public idContract: number | null;

    @Column({ type: "integer", name: "id_document", nullable: true })
    public idDocument: number | null;

    @Column({ type: "timestamp", name: "payment_date", nullable: false })
    public paymentDate: Date;

    @Column({ type: "decimal", name: "amount", precision: 10, scale: 2, nullable: false })
    public amount: number;

    @Column({ type: "integer", name: "number_installments", nullable: true })
    public numberInstallments: number | null;

    @Column({ type: "text", name: "payment_description", nullable: true })
    public paymentDescription: string | null;

    @ManyToOne(() => PaymentPlan, (paymentPlan) => paymentPlan.payments, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "id_payment_plan" }])
    public paymentPlan?: PaymentPlan;

    @ManyToOne(() => Contract, (contract) => contract.payments, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "id_contract" }])
    public contract?: Contract;

    @ManyToOne(() => Document, (document) => document.payments, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{ name: "id_document" }])
    public supportDocument?: Document;


    constructor(
        idPayment: number,
        idPaymentPlan: number,
        idContract: number | null,
        idDocument: number | null,
        paymentDate: Date,
        amount: number,
        numberInstallments: number | null,
        paymentDescription: string | null,
    ) {
        this.idPayment = idPayment;
        this.idPaymentPlan = idPaymentPlan;
        this.idContract = idContract;
        this.idDocument = idDocument;
        this.paymentDate = paymentDate;
        this.amount = amount;
        this.numberInstallments = numberInstallments;
        this.paymentDescription = paymentDescription;
    }
}
