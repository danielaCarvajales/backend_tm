export const SUPPORTED_EMAIL_LOCALES = ['es', 'en', 'pt'] as const;

export type SupportedEmailLocale = (typeof SUPPORTED_EMAIL_LOCALES)[number];

export function toSupportedEmailLocale(
  lang?: string | null,
): SupportedEmailLocale {
  const code = lang?.trim().toLowerCase().slice(0, 2);
  if (code === 'en' || code === 'pt' || code === 'es') {
    return code;
  }
  return 'es';
}

function pickFromAcceptLanguage(
  header: string | undefined,
): SupportedEmailLocale | null {
  if (!header?.trim()) {
    return null;
  }
  const parts = header.split(',').map((p) => {
    const [tag, qPart] = p.trim().split(';');
    const q = qPart?.trim().startsWith('q=')
      ? parseFloat(qPart.split('=')[1] ?? '1')
      : 1;
    return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 1 };
  });
  parts.sort((a, b) => b.q - a.q);
  for (const { tag } of parts) {
    const primary = tag.split('-')[0]?.slice(0, 2);
    if (primary === 'en' || primary === 'pt' || primary === 'es') {
      return primary;
    }
  }
  return null;
}

// Prioridad: idioma persistido 
export function resolveEmailLanguageFromSources(
  dbLanguage?: string | null,
  acceptLanguageHeader?: string | null,
): SupportedEmailLocale {
  if (dbLanguage?.trim()) {
    return toSupportedEmailLocale(dbLanguage);
  }
  return pickFromAcceptLanguage(acceptLanguageHeader ?? undefined) ?? 'es';
}
