import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';

import { getApiErrorMessage } from './errors';

describe('api errors', () => {
  it('uses backend error messages from axios responses', () => {
    const error = new AxiosError('Request failed', '400', undefined, undefined, {
      data: { message: 'name is required.' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {
        headers: {} as never,
      },
    });

    expect(getApiErrorMessage(error, 'Could not save.')).toBe('name is required.');
  });

  it('falls back for axios errors without backend messages', () => {
    const error = new AxiosError('Network Error');

    expect(getApiErrorMessage(error, 'Could not load.')).toBe('Could not load.');
  });

  it('uses regular error messages for non-axios errors', () => {
    expect(getApiErrorMessage(new Error('Unexpected failure.'), 'Could not load.')).toBe(
      'Unexpected failure.',
    );
  });
});
