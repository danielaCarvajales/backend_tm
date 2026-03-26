export class Credentials {
  constructor(
    public readonly id: number | undefined,
    public readonly username: string,
    public readonly password: string,
    public readonly state: number,
    public readonly lastAccess: Date,
    public readonly idPerson: number,
    public readonly codeCompany: number,
    public readonly failedAttempts: number,
    public readonly accountLockedUntil: Date | null,
  ) {}
}
