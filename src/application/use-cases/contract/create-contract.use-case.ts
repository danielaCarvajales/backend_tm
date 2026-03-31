import { Inject, Injectable } from '@nestjs/common';
import { Contract } from '../../../domain/entities/contract.entity';
import {
  CaseRecordWithRelations,
  ICaseRecordRepository,
} from '../../../domain/repositories/case-record.repository';
import {
  ContractWithRelations,
  IContractRepository,
} from '../../../domain/repositories/contract.repository';
import { PersonService } from '../../../domain/services/person.service';
import { CreateContractDto } from '../../dto/contract/create-contract.dto';
import { CASE_RECORD_REPOSITORY } from '../../tokens/case-record.repository.token';
import { CONTRACT_REPOSITORY } from '../../tokens/contract.repository.token';
import { nowColombia } from '../../../infrastructure/utils/date.util';

const MAX_UNIQUE_CODE_ATTEMPTS = 10;

const CLOSED_STATE_NAMES = new Set(['FINALIZADO', 'DENEGADO']);

function isCaseOpen(caseRecord: CaseRecordWithRelations): boolean {
  if (caseRecord.closingDate != null) {
    return false;
  }
  const name = (caseRecord.stateCase?.nameState ?? '').trim().toUpperCase();
  return !CLOSED_STATE_NAMES.has(name);
}

@Injectable()
export class CreateContractUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY)
    private readonly contractRepository: IContractRepository,
    @Inject(CASE_RECORD_REPOSITORY)
    private readonly caseRecordRepository: ICaseRecordRepository,
    private readonly personService: PersonService,
  ) {}

  async execute(dto: CreateContractDto): Promise<ContractWithRelations> {
    const caseRecord = await this.caseRecordRepository.findByIdWithRelations(
      dto.idCase,
    );
    if (!caseRecord) {
      throw new Error('CASE_NOT_FOUND');
    }
    if (!isCaseOpen(caseRecord)) {
      throw new Error('CASE_NOT_OPEN');
    }

    const contractCode = await this.generateUniqueContractCode(
      caseRecord.caseCode,
    );

    const entity = new Contract(
      undefined,
      contractCode,
      dto.idCase,
      dto.digitalSignature,
      nowColombia(),
    );
    const saved = await this.contractRepository.save(entity);

    const withRelations = await this.contractRepository.findByIdWithRelations(
      saved.idContract!,
    );
    if (!withRelations) {
      throw new Error('CONTRACT_NOT_FOUND');
    }
    return withRelations;
  }

  private async generateUniqueContractCode(seed: string): Promise<string> {
    for (let attempt = 0; attempt < MAX_UNIQUE_CODE_ATTEMPTS; attempt++) {
      const code = this.personService.generatePersonCode(seed);
      const existing = await this.contractRepository.findByContractCode(code);
      if (!existing) {
        return code;
      }
    }
    throw new Error('CONTRACT_CODE_GENERATION_FAILED');
  }
}
