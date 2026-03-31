export class Payment {
  constructor(
    public readonly idPayment: number | undefined,
    public readonly idPaymentPlan: number,
    public readonly idContract: number | null,
    public readonly idDocument: number | null,
    public readonly paymentDate: Date,
    public readonly amount: number,
    public readonly numberInstallments: number | null,
    public readonly paymentDescription: string | null,
  ) {}
}
