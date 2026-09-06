import { describe, expect, it } from 'vitest';

import { resolveTheme, resolveThemePreference } from './theme';

describe('theme preferences', () => {
  it('normalizes saved theme preferences', () => {
    expect(resolveThemePreference('light')).toBe('light');
    expect(resolveThemePreference('dark')).toBe('dark');
    expect(resolveThemePreference('system')).toBe('system');
    expect(resolveThemePreference('midnight')).toBe('system');
    expect(resolveThemePreference(null)).toBe('system');
  });

  it('resolves explicit theme choices', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('resolves system theme choices from the current system preference', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});
