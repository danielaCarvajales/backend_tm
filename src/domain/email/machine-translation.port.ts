/**
 * Punto de extensión opcional (p. ej. Google Translate, DeepL).
 * Implementar y registrar en DI si se requiere traducción automática en runtime.
 */
export interface MachineTranslationPort {
  translate(text: string, sourceLocale: string, targetLocale: string): Promise<string>;
}

export const MACHINE_TRANSLATION_PORT = Symbol('MACHINE_TRANSLATION_PORT');
