import { useImportPreviewWorkspace } from '../model/use-import-preview-workspace';

import { ImportPreviewWorkspaceView } from './import-preview-workspace-view';

export function ImportPage() {
  const workspace = useImportPreviewWorkspace();

  return <ImportPreviewWorkspaceView workspace={workspace} />;
}
