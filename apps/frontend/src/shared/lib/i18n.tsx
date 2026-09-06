import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Locale = 'en-US' | 'pt-BR';

const localeCurrencies: Record<Locale, string> = {
  'en-US': 'USD',
  'pt-BR': 'BRL',
};

const localeStorageKey = 'cofrin.locale';

const enUS = {
  'app.brand': 'cofrin.io',
  'nav.transactions': 'Transactions',
  'nav.configuration': 'Configuration',
  'language.label': 'Language',
  'language.enUS': 'English',
  'language.ptBR': 'Portuguese',
  'theme.label': 'Theme',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',
  'transactions.title': 'Transactions',
  'transactions.addRow': 'Add row',
  'transactions.setupRequired.title': 'Setup required',
  'transactions.setupRequired.description':
    'Create at least one account and one category before adding transactions.',
  'transactions.setupRequired.action': 'Open configuration',
  'transactions.loading': 'Loading transactions',
  'transactions.loadError': 'Could not load transactions.',
  'transactions.saveError': 'Could not save transaction.',
  'transactions.deleteError': 'Could not delete transaction.',
  'transactions.empty': 'No transactions yet.',
  'transactions.columns.date': 'Date',
  'transactions.columns.description': 'Description',
  'transactions.columns.amount': 'Amount',
  'transactions.columns.account': 'Account',
  'transactions.columns.category': 'Category',
  'transactions.columns.notes': 'Notes',
  'transactions.columns.actions': 'Actions',
  'transactions.actions.save': 'Save transaction',
  'transactions.actions.removeDraft': 'Remove draft row',
  'transactions.actions.delete': 'Delete transaction',
  'transactions.validation.dateRequired': 'Date is required.',
  'transactions.validation.descriptionRequired': 'Description is required.',
  'transactions.validation.amountRequired': 'Amount is required.',
  'transactions.validation.amountInvalid': 'Amount must be a valid number.',
  'transactions.validation.accountRequired': 'Account is required.',
  'transactions.validation.categoryRequired': 'Category is required.',
  'summary.income': 'Income',
  'summary.expenses': 'Expenses',
  'summary.balance': 'Balance',
  'configuration.title': 'Configuration',
  'configuration.description': 'Manage transaction accounts and categories.',
  'configuration.loading': 'Loading configuration',
  'configuration.loadError': 'Could not load configuration.',
  'configuration.accounts.title': 'Accounts',
  'configuration.categories.title': 'Categories',
  'configuration.form.name': 'Name',
  'configuration.form.type': 'Type',
  'configuration.form.balance': 'Balance',
  'configuration.form.cancel': 'Cancel',
  'configuration.accounts.save': 'Save account',
  'configuration.accounts.create': 'Create account',
  'configuration.accounts.empty': 'No accounts yet.',
  'configuration.accounts.saveError': 'Could not save account.',
  'configuration.accounts.deleteError': 'Could not delete account.',
  'configuration.accounts.deleteWarning':
    'Deleting an account also deletes related transactions.',
  'configuration.accounts.cancelDelete': 'Cancel account delete',
  'configuration.accounts.confirmDelete': 'Confirm account delete',
  'configuration.accounts.edit': 'Edit account',
  'configuration.accounts.delete': 'Delete account',
  'configuration.accounts.validation.nameRequired': 'Account name is required.',
  'configuration.accounts.validation.typeRequired': 'Account type is required.',
  'configuration.accounts.validation.balanceRequired': 'Initial balance is required.',
  'configuration.accounts.validation.balanceInvalid':
    'Initial balance must be a valid number.',
  'configuration.categories.save': 'Save category',
  'configuration.categories.create': 'Create category',
  'configuration.categories.empty': 'No categories yet.',
  'configuration.categories.saveError': 'Could not save category.',
  'configuration.categories.deleteError': 'Could not delete category.',
  'configuration.categories.deleteWarning':
    'Deleting a category also deletes related transactions.',
  'configuration.categories.cancelDelete': 'Cancel category delete',
  'configuration.categories.confirmDelete': 'Confirm category delete',
  'configuration.categories.edit': 'Edit category',
  'configuration.categories.delete': 'Delete category',
  'configuration.categories.validation.nameRequired': 'Category name is required.',
  'configuration.categories.validation.typeRequired': 'Category type is required.',
  'accountType.cash': 'Cash',
  'accountType.checking': 'Checking',
  'accountType.savings': 'Savings',
  'accountType.credit': 'Credit',
  'categoryType.expense': 'Expense',
  'categoryType.income': 'Income',
  'backendStatus.checking': 'Checking backend connection...',
  'backendStatus.unknownError': 'Unknown backend error',
  'backendStatus.recheck': 'Recheck backend connection',
  'dataTable.empty': 'No results.',
  'serviceStatus.columns.service': 'Service',
  'serviceStatus.columns.owner': 'Owner',
  'serviceStatus.columns.environment': 'Environment',
  'serviceStatus.columns.status': 'Status',
  'serviceStatus.environment.local': 'Local',
  'serviceStatus.environment.quality': 'Quality',
  'serviceStatus.environment.production': 'Production',
  'serviceStatus.status.online': 'Online',
  'serviceStatus.status.pending': 'Pending',
  'serviceStatus.status.planned': 'Planned',
} as const;

const ptBR: Record<TranslationKey, string> = {
  'app.brand': 'cofrin.io',
  'nav.transactions': 'Transações',
  'nav.configuration': 'Configuração',
  'language.label': 'Idioma',
  'language.enUS': 'Inglês',
  'language.ptBR': 'Português',
  'theme.label': 'Tema',
  'theme.light': 'Claro',
  'theme.dark': 'Escuro',
  'theme.system': 'Sistema',
  'transactions.title': 'Transações',
  'transactions.addRow': 'Adicionar linha',
  'transactions.setupRequired.title': 'Configuração obrigatória',
  'transactions.setupRequired.description':
    'Crie pelo menos uma conta e uma categoria antes de adicionar transações.',
  'transactions.setupRequired.action': 'Abrir configuração',
  'transactions.loading': 'Carregando transações',
  'transactions.loadError': 'Não foi possível carregar as transações.',
  'transactions.saveError': 'Não foi possível salvar a transação.',
  'transactions.deleteError': 'Não foi possível excluir a transação.',
  'transactions.empty': 'Nenhuma transação ainda.',
  'transactions.columns.date': 'Data',
  'transactions.columns.description': 'Descrição',
  'transactions.columns.amount': 'Valor',
  'transactions.columns.account': 'Conta',
  'transactions.columns.category': 'Categoria',
  'transactions.columns.notes': 'Observações',
  'transactions.columns.actions': 'Ações',
  'transactions.actions.save': 'Salvar transação',
  'transactions.actions.removeDraft': 'Remover linha em rascunho',
  'transactions.actions.delete': 'Excluir transação',
  'transactions.validation.dateRequired': 'A data é obrigatória.',
  'transactions.validation.descriptionRequired': 'A descrição é obrigatória.',
  'transactions.validation.amountRequired': 'O valor é obrigatório.',
  'transactions.validation.amountInvalid': 'O valor deve ser um número válido.',
  'transactions.validation.accountRequired': 'A conta é obrigatória.',
  'transactions.validation.categoryRequired': 'A categoria é obrigatória.',
  'summary.income': 'Receitas',
  'summary.expenses': 'Despesas',
  'summary.balance': 'Saldo',
  'configuration.title': 'Configuração',
  'configuration.description': 'Gerencie contas e categorias de transações.',
  'configuration.loading': 'Carregando configuração',
  'configuration.loadError': 'Não foi possível carregar a configuração.',
  'configuration.accounts.title': 'Contas',
  'configuration.categories.title': 'Categorias',
  'configuration.form.name': 'Nome',
  'configuration.form.type': 'Tipo',
  'configuration.form.balance': 'Saldo',
  'configuration.form.cancel': 'Cancelar',
  'configuration.accounts.save': 'Salvar conta',
  'configuration.accounts.create': 'Criar conta',
  'configuration.accounts.empty': 'Nenhuma conta ainda.',
  'configuration.accounts.saveError': 'Não foi possível salvar a conta.',
  'configuration.accounts.deleteError': 'Não foi possível excluir a conta.',
  'configuration.accounts.deleteWarning':
    'Excluir uma conta também exclui as transações relacionadas.',
  'configuration.accounts.cancelDelete': 'Cancelar exclusão da conta',
  'configuration.accounts.confirmDelete': 'Confirmar exclusão da conta',
  'configuration.accounts.edit': 'Editar conta',
  'configuration.accounts.delete': 'Excluir conta',
  'configuration.accounts.validation.nameRequired': 'O nome da conta é obrigatório.',
  'configuration.accounts.validation.typeRequired': 'O tipo da conta é obrigatório.',
  'configuration.accounts.validation.balanceRequired': 'O saldo inicial é obrigatório.',
  'configuration.accounts.validation.balanceInvalid':
    'O saldo inicial deve ser um número válido.',
  'configuration.categories.save': 'Salvar categoria',
  'configuration.categories.create': 'Criar categoria',
  'configuration.categories.empty': 'Nenhuma categoria ainda.',
  'configuration.categories.saveError': 'Não foi possível salvar a categoria.',
  'configuration.categories.deleteError': 'Não foi possível excluir a categoria.',
  'configuration.categories.deleteWarning':
    'Excluir uma categoria também exclui as transações relacionadas.',
  'configuration.categories.cancelDelete': 'Cancelar exclusão da categoria',
  'configuration.categories.confirmDelete': 'Confirmar exclusão da categoria',
  'configuration.categories.edit': 'Editar categoria',
  'configuration.categories.delete': 'Excluir categoria',
  'configuration.categories.validation.nameRequired':
    'O nome da categoria é obrigatório.',
  'configuration.categories.validation.typeRequired':
    'O tipo da categoria é obrigatório.',
  'accountType.cash': 'Dinheiro',
  'accountType.checking': 'Conta corrente',
  'accountType.savings': 'Poupança',
  'accountType.credit': 'Crédito',
  'categoryType.expense': 'Despesa',
  'categoryType.income': 'Receita',
  'backendStatus.checking': 'Verificando conexão com o backend...',
  'backendStatus.unknownError': 'Erro desconhecido no backend',
  'backendStatus.recheck': 'Verificar conexão com o backend novamente',
  'dataTable.empty': 'Nenhum resultado.',
  'serviceStatus.columns.service': 'Serviço',
  'serviceStatus.columns.owner': 'Responsavel',
  'serviceStatus.columns.environment': 'Ambiente',
  'serviceStatus.columns.status': 'Status',
  'serviceStatus.environment.local': 'Local',
  'serviceStatus.environment.quality': 'Qualidade',
  'serviceStatus.environment.production': 'Produção',
  'serviceStatus.status.online': 'Online',
  'serviceStatus.status.pending': 'Pendente',
  'serviceStatus.status.planned': 'Planejado',
};

const dictionaries = {
  'en-US': enUS,
  'pt-BR': ptBR,
};

export type TranslationKey = keyof typeof enUS;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  formatCurrency: (value: number) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function detectLocale(languages: readonly string[] = []): Locale {
  const normalizedLanguages = languages.map((language) => language.toLowerCase());

  if (normalizedLanguages.some((language) => language === 'pt-br' || language.startsWith('pt'))) {
    return 'pt-BR';
  }

  return 'en-US';
}

export function resolveInitialLocale({
  savedLocale,
  languages,
}: {
  savedLocale?: string | null;
  languages?: readonly string[];
}): Locale {
  if (savedLocale === 'en-US' || savedLocale === 'pt-BR') {
    return savedLocale;
  }

  return detectLocale(languages);
}

function readStoredLocale(): Locale | null {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedLocale = window.localStorage.getItem(localeStorageKey);

    return storedLocale === 'en-US' || storedLocale === 'pt-BR' ? storedLocale : null;
  } catch {
    return null;
  }
}

function writeStoredLocale(locale: Locale) {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(localeStorageKey, locale);
  } catch {
    // localStorage can be unavailable in private or restricted contexts.
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    resolveInitialLocale({
      savedLocale: readStoredLocale(),
      languages: typeof navigator === 'undefined' ? [] : navigator.languages,
    }),
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    function setLocale(nextLocale: Locale) {
      setLocaleState(nextLocale);
      writeStoredLocale(nextLocale);
    }

    return {
      locale,
      setLocale,
      t: (key) => dictionaries[locale][key],
      formatCurrency: (amount) =>
        new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: localeCurrencies[locale],
        }).format(amount),
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider.');
  }

  return context;
}
