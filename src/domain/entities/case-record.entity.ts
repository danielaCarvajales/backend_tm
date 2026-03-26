export class CaseRecord {
  constructor(
    public readonly idCase: number | undefined,
    public readonly caseCode: string,
    public readonly holder: number,
    public readonly agent: number | null,
    public readonly codeCompany: number,
    public readonly idStateCase: number,
    public readonly createdAt: Date,
    public readonly closingDate: Date | null,
  ) {}
}
