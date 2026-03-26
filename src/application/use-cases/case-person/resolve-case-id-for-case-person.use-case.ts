import { Injectable } from '@nestjs/common';
import { GetCaseRecordByIdUseCase } from '../case-record/get-case-record-by-id.use-case';
import { GetOrCreateCurrentCaseUseCase } from '../case-record/get-or-create-current-case.use-case';
import { JwtPayload } from '../../../infrastructure/auth/strategies/jwt.strategy';


@Injectable()
export class ResolveCaseIdForCasePersonUseCase {
  constructor(
    private readonly getCaseRecordByIdUseCase: GetCaseRecordByIdUseCase,
    private readonly getOrCreateCurrentCaseUseCase: GetOrCreateCurrentCaseUseCase,
  ) {}

  async execute(
    user: JwtPayload,
    idCaseFromBody?: number,
  ): Promise<number> {
    if (idCaseFromBody !== undefined) {
      const caseRecord = await this.getCaseRecordByIdUseCase.execute(
        idCaseFromBody,
        user.userId,
        user.role,
      );
      if (!caseRecord) {
        throw new Error('CASE_NOT_FOUND');
      }
      return idCaseFromBody;
    }

    const isCliente = (user.role?.toLowerCase() ?? '') === 'cliente';
    if (!isCliente) {
      throw new Error('CASE_ID_REQUIRED_FOR_ROLE');
    }

    const currentCase = await this.getOrCreateCurrentCaseUseCase.execute(
      user.userId,
      user.codeCompany,
    );
    return currentCase.idCase;
  }
}
