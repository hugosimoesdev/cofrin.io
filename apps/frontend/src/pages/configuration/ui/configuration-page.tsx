import { useConfigurationWorkspace } from '../model/use-configuration-workspace';

import { ConfigurationWorkspaceView } from './configuration-workspace-view';

export function ConfigurationPage() {
  const workspace = useConfigurationWorkspace();

  return <ConfigurationWorkspaceView workspace={workspace} />;
}
