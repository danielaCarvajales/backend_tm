export class IdentityDocumentType {
  constructor(
    public readonly idTypeIdentificationDocument: number | undefined,
    public readonly name: string,
    public readonly abbreviation: string,
  ) {}
}
