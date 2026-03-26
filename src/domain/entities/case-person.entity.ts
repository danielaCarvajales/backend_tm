export class CasePerson {
  constructor(
    public readonly idCasePerson: number | undefined,
    public readonly idCase: number,
    public readonly idPerson: number,
    public readonly idFamilyRelationship: number,
    public readonly statePerson: number,
    public readonly createdAt: Date,
    public readonly observation: string | null,
  ) {}
}
