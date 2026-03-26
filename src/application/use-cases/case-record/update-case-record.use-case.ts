import { Inject, Injectable } from '@nestjs/common';
import { CaseRecord } from '../../../domain/entities/case-record.entity';
import { ICaseRecordRepository } from '../../../domain/repositories/case-record.repository';
import { IStateCaseRepository } from '../../../domain/repositories/state-case.repository';
import { UpdateCaseRecordDto } from '../../dto/case-record/update-case-record.dto';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';
import { STATE_CASE_REPOSITORY } from '../../tokens/state-case.repository.token';
import { nowColombia } from '../../../infrastructure/utils/date.util';

const STATE_FINALIZADO_NAME = 'FINALIZADO';

export type CaseRecordUpdateRole = 'Cliente' | 'Asesor' | 'Administrador';

@Injectable()
export class UpdateCaseRecordUseCase {
  constructor(
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly repository: ICaseRecordRepository,
    @Inject(STATE_CASE_REPOSITORY)
    private readonly stateCaseRepository: IStateCaseRepository,
  ) {}

  async execute(
    idCase: number,
    dto: UpdateCaseRecordDto,
    role: CaseRecordUpdateRole,
    userId?: number,
  ): Promise<CaseRecord> {
    const existing = await this.repository.findById(idCase);
    if (!existing) {
      throw new Error('CASE_RECORD_NOT_FOUND');
    }

    const normalizedRole = this.normalizeRole(role);
    if (normalizedRole === 'cliente' && userId !== undefined && existing.holder !== userId) {
      throw new Error('CASE_RECORD_NOT_FOUND');
    }
    const agent = this.canUpdateAgent(normalizedRole) ? dto.agent : existing.agent;
    const idStateCase = this.canUpdateState(normalizedRole)
      ? (dto.idStateCase ?? existing.idStateCase)
      : existing.idStateCase;

    const closingDate = await this.resolveClosingDate(
      existing.idStateCase,
      idStateCase,
      existing.closingDate,
    );

    const updated = new CaseRecord(
      idCase,
      existing.caseCode,
      existing.holder,
      agent ?? null,
      existing.codeCompany,
      idStateCase,
      existing.createdAt,
      closingDate,
    );
    return this.repository.update(updated);
  }

  private normalizeRole(role: string): string {
    return role?.toLowerCase() ?? '';
  }

  private canUpdateAgent(role: string): boolean {
    return role === 'asesor' || role === 'administrador';
  }

  private canUpdateState(role: string): boolean {
    return role === 'administrador';
  }

  private async resolveClosingDate(
    currentStateId: number,
    newStateId: number,
    currentClosingDate: Date | null,
  ): Promise<Date | null> {
    if (currentStateId === newStateId) {
      return currentClosingDate;
    }
    const finalizadoState = await this.stateCaseRepository.findByName(
      STATE_FINALIZADO_NAME,
    );
    if (!finalizadoState || newStateId !== finalizadoState.idState) {
      return currentClosingDate;
    }
    return nowColombia();
  }
}
