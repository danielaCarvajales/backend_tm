export class Person {
  constructor(
    public readonly idPerson: number | undefined,
    public readonly personCode: string,
    public readonly fullName: string,
    public readonly idTypeDocument: number,
    public readonly documentNumber: string,
    public readonly birthdate: Date,
    public readonly idNationality: number,
    public readonly phone: string,
    public readonly email: string,
  ) {}
}
