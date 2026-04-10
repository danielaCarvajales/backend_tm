import { Global, Module } from '@nestjs/common';
import { join } from 'path';
import { I18nJsonLoader, I18nModule } from 'nestjs-i18n';

@Global()
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      fallbacks: {
        'pt-BR': 'pt',
        'en-US': 'en',
        'en-GB': 'en',
      },
      loader: I18nJsonLoader,
      loaderOptions: {
        path: join(__dirname, '../../i18n'),
        watch: process.env.NODE_ENV !== 'production',
      },
      disableMiddleware: true,
      logging: false,
      throwOnMissingKey: false,
    }),
  ],
  exports: [I18nModule],
})
export class AppI18nModule {}
