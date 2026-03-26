import { generateRandomDigits } from '../utils/random-digits.util';

const CUSTOMER_CODE_PREFIX = 'CLI';
const RANDOM_DIGITS_LENGTH = 5;

export class CustomerProfileService {
  // Generates a customer code: CLI + 5 random digits.
  generateCustomerCode(): string {
    const randomSuffix = generateRandomDigits(RANDOM_DIGITS_LENGTH);
    return `${CUSTOMER_CODE_PREFIX}${randomSuffix}`;
  }
}
