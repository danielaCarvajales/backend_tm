import { ConfigService } from '@nestjs/config';
import { resolveEmailLogoUrl } from '../email-logo-url.resolver';

function mockConfig(
  map: Record<string, string | undefined>,
): ConfigService {
  return {
    get: (key: string) => map[key],
  } as unknown as ConfigService;
}

describe('resolveEmailLogoUrl', () => {
  it('uses EMAIL_LOGO_URL when set', () => {
    expect(
      resolveEmailLogoUrl(
        mockConfig({
          EMAIL_LOGO_URL:
            'https://tramintesmigratorios.atl1.cdn.digitaloceanspaces.com/assets/logotm.png',
        }),
      ),
    ).toBe(
      'https://tramintesmigratorios.atl1.cdn.digitaloceanspaces.com/assets/logotm.png',
    );
  });

  it('builds from DO_SPACES_PUBLIC_BASE_URL and default key', () => {
    expect(
      resolveEmailLogoUrl(
        mockConfig({
          DO_SPACES_PUBLIC_BASE_URL:
            'https://tramintesmigratorios.atl1.cdn.digitaloceanspaces.com',
        }),
      ),
    ).toBe(
      'https://tramintesmigratorios.atl1.cdn.digitaloceanspaces.com/assets/logotm.png',
    );
  });

  it('returns empty when nothing configured', () => {
    expect(resolveEmailLogoUrl(mockConfig({}))).toBe('');
  });
});
