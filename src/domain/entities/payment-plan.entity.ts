export class PaymentPlan {
  constructor(
    public readonly idPaymentPlan: number | undefined,
    public readonly name: string,
    public readonly description: string | null,
    public readonly dueDays: number,
  ) {}
}
