import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  accountQueries,
  createAccount,
  deleteAccount,
  updateAccount,
  type Account,
} from '@/entities/accounts';
import {
  categoryQueries,
  createCategory,
  deleteCategory,
  updateCategory,
  type Category,
} from '@/entities/categories';
import { transactionQueries } from '@/entities/transactions';
import { getApiErrorMessage } from '@/shared/api';
import { useI18n } from '@/shared/lib';

export type AccountForm = {
  name: string;
  type: string;
  initialBalance: string;
};

export type CategoryForm = {
  name: string;
  type: string;
};

export type ConfigurationWorkspace = {
  accounts: Account[];
  categories: Category[];
  isLoading: boolean;
  loadErrorMessage: string | null;
  accountForm: AccountForm;
  categoryForm: CategoryForm;
  editingAccountId: string | null;
  editingCategoryId: string | null;
  confirmingAccountDeleteId: string | null;
  confirmingCategoryDeleteId: string | null;
  accountFormError: string | null;
  categoryFormError: string | null;
  accountDeleteError: string | null;
  categoryDeleteError: string | null;
  pendingAccountId: string | null;
  pendingCategoryId: string | null;
  isSavingAccount: boolean;
  isSavingCategory: boolean;
  hasPendingMutation: boolean;
  updateAccountForm: (field: keyof AccountForm, value: string) => void;
  updateCategoryForm: (field: keyof CategoryForm, value: string) => void;
  submitAccountForm: () => void;
  submitCategoryForm: () => void;
  startAccountEdit: (account: Account) => void;
  startCategoryEdit: (category: Category) => void;
  cancelAccountEdit: () => void;
  cancelCategoryEdit: () => void;
  requestAccountDelete: (id: string) => void;
  requestCategoryDelete: (id: string) => void;
  cancelAccountDelete: () => void;
  cancelCategoryDelete: () => void;
  confirmAccountDelete: (id: string) => void;
  confirmCategoryDelete: (id: string) => void;
};

const emptyAccountForm: AccountForm = {
  name: '',
  type: 'cash',
  initialBalance: '0',
};

const emptyCategoryForm: CategoryForm = {
  name: '',
  type: 'expense',
};

function accountToForm(account: Account): AccountForm {
  return {
    name: account.name,
    type: account.type,
    initialBalance: String(account.initialBalance),
  };
}

function categoryToForm(category: Category): CategoryForm {
  return {
    name: category.name,
    type: category.type,
  };
}

export function useConfigurationWorkspace(): ConfigurationWorkspace {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const accountsQuery = useQuery(accountQueries.list());
  const categoriesQuery = useQuery(categoryQueries.list());

  const [accountForm, setAccountForm] = useState<AccountForm>(emptyAccountForm);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [confirmingAccountDeleteId, setConfirmingAccountDeleteId] = useState<string | null>(null);
  const [confirmingCategoryDeleteId, setConfirmingCategoryDeleteId] = useState<string | null>(null);
  const [accountFormError, setAccountFormError] = useState<string | null>(null);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
  const [accountDeleteError, setAccountDeleteError] = useState<string | null>(null);
  const [categoryDeleteError, setCategoryDeleteError] = useState<string | null>(null);

  const accounts = accountsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const loadError = accountsQuery.error ?? categoriesQuery.error;

  const saveAccountMutation = useMutation({
    mutationFn: (form: AccountForm) => {
      const request = {
        name: form.name.trim(),
        type: form.type.trim(),
        initialBalance: form.initialBalance.trim(),
      };

      return editingAccountId
        ? updateAccount(editingAccountId, request)
        : createAccount(request);
    },
    onSuccess: () => {
      setAccountForm(emptyAccountForm);
      setEditingAccountId(null);
      setAccountFormError(null);
      void queryClient.invalidateQueries({ queryKey: accountQueries.all() });
    },
    onError: (error) => {
      setAccountFormError(getApiErrorMessage(error, t('configuration.accounts.saveError')));
    },
  });

  const saveCategoryMutation = useMutation({
    mutationFn: (form: CategoryForm) => {
      const request = {
        name: form.name.trim(),
        type: form.type.trim(),
      };

      return editingCategoryId
        ? updateCategory(editingCategoryId, request)
        : createCategory(request);
    },
    onSuccess: () => {
      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      setCategoryFormError(null);
      void queryClient.invalidateQueries({ queryKey: categoryQueries.all() });
    },
    onError: (error) => {
      setCategoryFormError(getApiErrorMessage(error, t('configuration.categories.saveError')));
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      setConfirmingAccountDeleteId(null);
      setAccountDeleteError(null);
      void queryClient.invalidateQueries({ queryKey: accountQueries.all() });
      void queryClient.invalidateQueries({ queryKey: transactionQueries.all() });
    },
    onError: (error) => {
      setAccountDeleteError(getApiErrorMessage(error, t('configuration.accounts.deleteError')));
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      setConfirmingCategoryDeleteId(null);
      setCategoryDeleteError(null);
      void queryClient.invalidateQueries({ queryKey: categoryQueries.all() });
      void queryClient.invalidateQueries({ queryKey: transactionQueries.all() });
    },
    onError: (error) => {
      setCategoryDeleteError(getApiErrorMessage(error, t('configuration.categories.deleteError')));
    },
  });

  function updateAccountForm(field: keyof AccountForm, value: string) {
    setAccountForm((currentForm) => ({ ...currentForm, [field]: value }));
    setAccountFormError(null);
  }

  function updateCategoryForm(field: keyof CategoryForm, value: string) {
    setCategoryForm((currentForm) => ({ ...currentForm, [field]: value }));
    setCategoryFormError(null);
  }

  function submitAccountForm() {
    if (!accountForm.name.trim()) {
      setAccountFormError(t('configuration.accounts.validation.nameRequired'));
      return;
    }
    if (!accountForm.type.trim()) {
      setAccountFormError(t('configuration.accounts.validation.typeRequired'));
      return;
    }
    if (!accountForm.initialBalance.trim()) {
      setAccountFormError(t('configuration.accounts.validation.balanceRequired'));
      return;
    }
    if (!Number.isFinite(Number(accountForm.initialBalance))) {
      setAccountFormError(t('configuration.accounts.validation.balanceInvalid'));
      return;
    }

    saveAccountMutation.mutate(accountForm);
  }

  function submitCategoryForm() {
    if (!categoryForm.name.trim()) {
      setCategoryFormError(t('configuration.categories.validation.nameRequired'));
      return;
    }
    if (!categoryForm.type.trim()) {
      setCategoryFormError(t('configuration.categories.validation.typeRequired'));
      return;
    }

    saveCategoryMutation.mutate(categoryForm);
  }

  function startAccountEdit(account: Account) {
    setAccountForm(accountToForm(account));
    setEditingAccountId(account.id);
    setAccountFormError(null);
  }

  function startCategoryEdit(category: Category) {
    setCategoryForm(categoryToForm(category));
    setEditingCategoryId(category.id);
    setCategoryFormError(null);
  }

  function cancelAccountEdit() {
    setAccountForm(emptyAccountForm);
    setEditingAccountId(null);
    setAccountFormError(null);
  }

  function cancelCategoryEdit() {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
    setCategoryFormError(null);
  }

  function requestAccountDelete(id: string) {
    setConfirmingAccountDeleteId(id);
    setAccountDeleteError(null);
  }

  function requestCategoryDelete(id: string) {
    setConfirmingCategoryDeleteId(id);
    setCategoryDeleteError(null);
  }

  return {
    accounts,
    categories,
    isLoading: accountsQuery.isLoading || categoriesQuery.isLoading,
    loadErrorMessage: loadError
      ? getApiErrorMessage(loadError, t('configuration.loadError'))
      : null,
    accountForm,
    categoryForm,
    editingAccountId,
    editingCategoryId,
    confirmingAccountDeleteId,
    confirmingCategoryDeleteId,
    accountFormError,
    categoryFormError,
    accountDeleteError,
    categoryDeleteError,
    pendingAccountId: deleteAccountMutation.isPending ? deleteAccountMutation.variables : null,
    pendingCategoryId: deleteCategoryMutation.isPending ? deleteCategoryMutation.variables : null,
    isSavingAccount: saveAccountMutation.isPending,
    isSavingCategory: saveCategoryMutation.isPending,
    hasPendingMutation:
      saveAccountMutation.isPending ||
      saveCategoryMutation.isPending ||
      deleteAccountMutation.isPending ||
      deleteCategoryMutation.isPending,
    updateAccountForm,
    updateCategoryForm,
    submitAccountForm,
    submitCategoryForm,
    startAccountEdit,
    startCategoryEdit,
    cancelAccountEdit,
    cancelCategoryEdit,
    requestAccountDelete,
    requestCategoryDelete,
    cancelAccountDelete: () => setConfirmingAccountDeleteId(null),
    cancelCategoryDelete: () => setConfirmingCategoryDeleteId(null),
    confirmAccountDelete: (id: string) => deleteAccountMutation.mutate(id),
    confirmCategoryDelete: (id: string) => deleteCategoryMutation.mutate(id),
  };
}
