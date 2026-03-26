import * as bcrypt from 'bcryptjs';


const BCRYPT_COST_FACTOR = 12;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_COST_FACTOR);
}

export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
