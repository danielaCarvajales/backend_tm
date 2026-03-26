import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Audit log for authentication events (login success/failure).
 * Security: Enables forensic analysis and detection of brute-force attempts.
 */
@Entity('auth_audit_log')
export class AuthAuditLog {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'username', length: 250, nullable: false })
  username: string;

  @Column({ type: 'integer', name: 'code_company', nullable: false })
  codeCompany: number;

  @Column({ type: 'boolean', name: 'success', nullable: false })
  success: boolean;

  @Column({ type: 'timestamp', name: 'occurred_at', nullable: false })
  occurredAt: Date;

  @Column({ type: 'varchar', name: 'ip_address', length: 45, nullable: true })
  ipAddress: string | null;

  constructor(username: string, codeCompany: number, success: boolean, occurredAt: Date, ipAddress?: string) {
    this.username = username;
    this.codeCompany = codeCompany;
    this.success = success;
    this.occurredAt = occurredAt;
    this.ipAddress = ipAddress ?? null;
  }
}
