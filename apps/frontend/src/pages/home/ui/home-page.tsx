import { useTransactionWorkspace } from '../model/use-transaction-workspace';

import { TransactionWorkspaceView } from './transaction-workspace-view';

export function HomePage() {
  const workspace = useTransactionWorkspace();

  return <TransactionWorkspaceView workspace={workspace} />;
}
