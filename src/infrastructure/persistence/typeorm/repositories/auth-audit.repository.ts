import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IAuthAuditRepository } from '../../../../domain/repositories/auth-audit.repository';
import { AuthAuditLog } from '../entities/auth-audit-log/auth-audit-log';

@Injectable()
export class AuthAuditTypeOrmRepository implements IAuthAuditRepository {
  constructor(private readonly dataSource: DataSource) {}

  async logLoginAttempt(
    username: string,
    codeCompany: number,
    success: boolean,
    ipAddress?: string,
  ): Promise<void> {
    const log = new AuthAuditLog(username, codeCompany, success, new Date(), ipAddress);
    await this.dataSource.getRepository(AuthAuditLog).save(log);
  }
}
