import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Payment } from "../payment/payment";

@Entity('payment_plans', { schema: 'public' })
export class PaymentPlan {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_payment_plan" })
    public idPaymentPlan: number;

    @Column({ type: "varchar", name: "name", length: 100, nullable: false })
    public name: string;

    @Column({ type: "text", name: "description", nullable: true })
    public description: string | null;

    @Column({ type: "integer", name: "due_days", nullable: false })
    public dueDays: number;

    @OneToMany(() => Payment, (payment) => payment.paymentPlan)
    public payments?: Payment[];

    constructor(name: string, description: string | null, dueDays: number) {
        this.name = name;
        this.description = description;
        this.dueDays = dueDays;
    }

}
