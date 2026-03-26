export function generateRandomDigits(length: number): string {
  const digits: string[] = [];
  for (let i = 0; i < length; i++) {
    digits.push(String(Math.floor(Math.random() * 10)));
  }
  return digits.join('');
}
