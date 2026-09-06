import { describe, expect, it } from 'vitest';

import { detectLocale, resolveInitialLocale } from './i18n';

describe('i18n preferences', () => {
  it('detects Portuguese browser languages', () => {
    expect(detectLocale(['pt-BR', 'en-US'])).toBe('pt-BR');
    expect(detectLocale(['pt-PT', 'en-US'])).toBe('pt-BR');
  });

  it('falls back to English for unsupported browser languages', () => {
    expect(detectLocale(['es-ES', 'fr-FR'])).toBe('en-US');
    expect(detectLocale()).toBe('en-US');
  });

  it('uses a saved locale before browser detection', () => {
    expect(resolveInitialLocale({ savedLocale: 'pt-BR', languages: ['en-US'] })).toBe('pt-BR');
    expect(resolveInitialLocale({ savedLocale: 'en-US', languages: ['pt-BR'] })).toBe('en-US');
  });

  it('ignores invalid saved locales', () => {
    expect(resolveInitialLocale({ savedLocale: 'es-ES', languages: ['pt-BR'] })).toBe('pt-BR');
  });
});
