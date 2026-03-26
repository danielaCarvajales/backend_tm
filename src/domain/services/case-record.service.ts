import { generateRandomDigits } from '../utils/random-digits.util';

const CASE_CODE_PREFIX = 'CAS';
const RANDOM_DIGITS_LENGTH = 5;

export class CaseRecordService {
  generateCaseCode(): string {
    const randomSuffix = generateRandomDigits(RANDOM_DIGITS_LENGTH);
    return `${CASE_CODE_PREFIX}${randomSuffix}`;
  }
}
