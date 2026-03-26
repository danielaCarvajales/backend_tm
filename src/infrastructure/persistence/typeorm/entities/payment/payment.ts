import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PaymentPlan } from "../payment-plan/payment-plan";
import { Contract } from "../contract/contract";

@Entity('payments', { schema: 'public' })
export class Payment {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_payment" })
    public idPayment: number;

    @Column({ type: "integer", name: "id_payment_plan", nullable: false })
    public idPaymentPlan: number;

    @Column({ type: "integer", name: "id_contract", nullable: true })
    public idContract: number;

    @Column({ type: "timestamp", name: "payment_date", nullable: false })
    public paymentDate: Date;

    @Column({ type: "decimal", name: "amount", precision: 10, scale: 2, nullable: false })
    public amount: number;

    @Column({ type: "integer", name: "number_installments", nullable: true })
    public numberInstallments: number;

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

    constructor(idPayment: number, idPaymentPlan: number, idContract: number, paymentDate: Date, amount: number, numberInstallments: number) {
        this.idPayment = idPayment;
        this.idPaymentPlan = idPaymentPlan;
        this.idContract = idContract;
        this.paymentDate = paymentDate;
        this.amount = amount;
        this.numberInstallments = numberInstallments;
    }
}
