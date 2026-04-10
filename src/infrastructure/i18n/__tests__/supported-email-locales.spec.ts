import {
  resolveEmailLanguageFromSources,
  toSupportedEmailLocale,
} from '../supported-email-locales';

describe('supported-email-locales', () => {
  it('toSupportedEmailLocale maps known codes and defaults to es', () => {
    expect(toSupportedEmailLocale('EN')).toBe('en');
    expect(toSupportedEmailLocale('pt-BR')).toBe('pt');
    expect(toSupportedEmailLocale('fr')).toBe('es');
    expect(toSupportedEmailLocale('')).toBe('es');
  });

  it('resolveEmailLanguageFromSources prefers DB over Accept-Language', () => {
    expect(
      resolveEmailLanguageFromSources('en', 'es,en;q=0.8'),
    ).toBe('en');
  });

  it('resolveEmailLanguageFromSources uses Accept-Language when DB empty', () => {
    expect(resolveEmailLanguageFromSources('', 'en-US,es;q=0.5')).toBe(
      'en',
    );
    expect(resolveEmailLanguageFromSources(null, 'pt')).toBe('pt');
  });

  it('resolveEmailLanguageFromSources falls back to es', () => {
    expect(resolveEmailLanguageFromSources(null, null)).toBe('es');
    expect(resolveEmailLanguageFromSources(undefined, 'fr-CH')).toBe('es');
  });
});
