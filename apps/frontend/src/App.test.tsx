import { describe, expect, it } from 'vitest';

describe('App scaffold', () => {
  it('keeps the smoke-test suite wired', () => {
    expect('cofrin.io').toContain('cofrin');
  });
});
