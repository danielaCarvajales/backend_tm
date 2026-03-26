export interface IAuthAuditRepository {
  logLoginAttempt(
    username: string,
    codeCompany: number,
    success: boolean,
    ipAddress?: string,
  ): Promise<void>;
}
