export class Contract {
  constructor(
    public readonly idContract: number | undefined,
    public readonly contractCode: string,
    public readonly idCase: number,
    public readonly digitalSignature: string | null,
    public readonly createdAt: Date,
  ) {}
}
