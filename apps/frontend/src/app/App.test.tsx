import { describe, expect, it } from 'vitest';

import { appRoutes } from '@/shared/config';

describe('App scaffold', () => {
  it('keeps the smoke-test suite wired', () => {
    expect('cofrin.io').toContain('cofrin');
  });

  it('defines the primary application routes', () => {
    expect(appRoutes).toEqual({
      home: '/',
      configuration: '/configuration',
    });
  });
});
