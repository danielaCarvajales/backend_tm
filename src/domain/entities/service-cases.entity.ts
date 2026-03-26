export class ServiceCases {
  constructor(
    public readonly idServiceCases: number | undefined,
    public readonly idCase: number,
    public readonly idServices: number,
    public readonly observation: string | null,
    public readonly createdAt: Date,
  ) {}
}
