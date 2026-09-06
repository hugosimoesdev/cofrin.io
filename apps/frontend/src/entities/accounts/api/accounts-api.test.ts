import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createAccount,
  deleteAccount,
  fetchAccounts,
  updateAccount,
  type AccountRequest,
} from './accounts-api';

const request: AccountRequest = {
  name: 'Wallet',
  type: 'cash',
  initialBalance: '0',
};

describe('accounts api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches accounts', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json([
        {
          id: 'account-1',
          name: 'Wallet',
          type: 'cash',
          initialBalance: 0,
        },
      ]),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchAccounts()).resolves.toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/accounts');
  });

  it('creates accounts', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        id: 'account-1',
        ...request,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await createAccount(request);

    expect(fetchMock).toHaveBeenCalledWith('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  });

  it('updates accounts', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        id: 'account-1',
        ...request,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await updateAccount('account-1', request);

    expect(fetchMock).toHaveBeenCalledWith('/api/accounts/account-1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  });

  it('deletes accounts', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await deleteAccount('account-1');

    expect(fetchMock).toHaveBeenCalledWith('/api/accounts/account-1', {
      method: 'DELETE',
    });
  });

  it('uses backend error messages when requests fail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ message: 'name is required.' }, { status: 400 })),
    );

    await expect(createAccount(request)).rejects.toThrow('name is required.');
  });
});
