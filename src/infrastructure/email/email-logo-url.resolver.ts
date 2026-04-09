import type { ConfigService } from '@nestjs/config';

/**
 * 1) EMAIL_LOGO_URL — URL completa.
 * 2) DO_SPACES_PUBLIC_BASE_URL + EMAIL_LOGO_SPACES_KEY (por defecto assets/logotm.png).
 */
export function resolveEmailLogoUrl(config: ConfigService): string {
  const explicit = config.get<string>('EMAIL_LOGO_URL')?.trim();
  if (explicit) {
    return explicit;
  }
  const base = config.get<string>('DO_SPACES_PUBLIC_BASE_URL')?.trim();
  if (!base) {
    return '';
  }
  const key =
    config.get<string>('EMAIL_LOGO_SPACES_KEY')?.trim() ?? 'assets/logotm.png';
  const normalizedBase = base.replace(/\/$/, '');
  const normalizedKey = key.replace(/^\//, '');
  return `${normalizedBase}/${normalizedKey}`;
}
