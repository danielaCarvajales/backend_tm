export class PersonRole {
  constructor(
    public readonly idPersonRole: number | undefined,
    public readonly idPerson: number,
    public readonly idRole: number,
    public readonly codeCompany: number,
    public readonly idState: number,
    public readonly assignmentDate: Date,
    public readonly revocationDate: Date | null,
  ) {}
}
