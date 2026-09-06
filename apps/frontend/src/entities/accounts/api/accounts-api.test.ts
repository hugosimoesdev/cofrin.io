import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/shared/api';

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
    vi.restoreAllMocks();
  });

  it('fetches accounts', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: [
        {
          id: 'account-1',
          name: 'Wallet',
          type: 'cash',
          initialBalance: 0,
        },
      ],
    });

    await expect(fetchAccounts()).resolves.toHaveLength(1);
    expect(getSpy).toHaveBeenCalledWith('/api/accounts');
  });

  it('creates accounts', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        id: 'account-1',
        ...request,
      },
    });

    await createAccount(request);

    expect(postSpy).toHaveBeenCalledWith('/api/accounts', request);
  });

  it('updates accounts', async () => {
    const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({
      data: {
        id: 'account-1',
        ...request,
      },
    });

    await updateAccount('account-1', request);

    expect(putSpy).toHaveBeenCalledWith('/api/accounts/account-1', request);
  });

  it('deletes accounts', async () => {
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue({});

    await deleteAccount('account-1');

    expect(deleteSpy).toHaveBeenCalledWith('/api/accounts/account-1');
  });

  it('rejects when requests fail', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('name is required.'));

    await expect(createAccount(request)).rejects.toThrow('name is required.');
  });
});
