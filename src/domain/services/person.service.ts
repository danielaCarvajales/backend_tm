import { generateRandomDigits } from '../utils/random-digits.util';

export class PersonService {
  private static readonly RANDOM_DIGITS_LENGTH = 5;

  // Generates personCode from full name: initials (uppercase) + 5 random digits. 
  generatePersonCode(fullName: string): string {
    const initials = this.extractInitials(fullName);
    const randomSuffix = generateRandomDigits(PersonService.RANDOM_DIGITS_LENGTH);
    return `${initials}${randomSuffix}`;
  }

  private extractInitials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter((p) => p.length > 0);
    const initials = parts.map((part) => part.charAt(0).toUpperCase()).join('');
    return initials || 'X';
  }
}
