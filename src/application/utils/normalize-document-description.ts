export function normalizeDocumentDescription(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}
