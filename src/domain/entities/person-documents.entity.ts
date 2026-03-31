export class PersonDocuments {
  constructor(
    public readonly idPersonDocuments: number | undefined,
    public readonly idPerson: number,
    public readonly idDocument: number,
  ) {}
}
