export class CustomerProfile {
  constructor(
    public readonly idCustomerProfile: number | undefined,
    public readonly idPersonRole: number,
    public readonly codeCustomer: string,
    public readonly createdAt: Date,
  ) {}
}
