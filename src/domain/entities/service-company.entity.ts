export class ServiceCompany {
  constructor(
    public readonly idService: number | undefined,
    public readonly codeCompany: number,
    public readonly name: string,
    public readonly description: string,
  ) {}
}
