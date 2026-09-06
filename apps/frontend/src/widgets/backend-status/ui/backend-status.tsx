import { useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';

import { fetchGreeting } from '@/entities/backend-status';
import { getApiErrorMessage } from '@/shared/api';
import { useI18n } from '@/shared/lib';
import { Button } from '@/shared/ui/button';

type ApiState =
  | { status: 'loading' }
  | { status: 'ready'; message: string }
  | { status: 'error'; message: string };

export function BackendStatus() {
  const { t } = useI18n();
  const [apiState, setApiState] = useState<ApiState>({ status: 'loading' });

  function checkBackend() {
    setApiState({ status: 'loading' });
    fetchGreeting()
      .then((greeting) => {
        setApiState({ status: 'ready', message: greeting.message });
      })
      .catch((error: unknown) => {
        const message = getApiErrorMessage(error, t('backendStatus.unknownError'));
        setApiState({ status: 'error', message });
      });
  }

  useEffect(() => {
    checkBackend();
  }, []);

  const isLoading = apiState.status === 'loading';

  return (
    <div
      className={`api-status api-status--${apiState.status} mb-6 inline-flex min-h-12 items-center gap-3 rounded-lg border border-border bg-card/70 px-4 py-3 text-card-foreground shadow-sm max-[560px]:w-full max-[560px]:items-start`}
    >
      <span
        className="status-dot mt-[0.45rem] inline-block size-2.5 shrink-0 rounded-full"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        {isLoading && t('backendStatus.checking')}
        {apiState.status === 'ready' && apiState.message}
        {apiState.status === 'error' && apiState.message}
      </span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={checkBackend}
        disabled={isLoading}
        aria-label={t('backendStatus.recheck')}
      >
        <RotateCw className={isLoading ? 'animate-spin' : undefined} />
        {t('backendStatus.recheck')}
      </Button>
    </div>
  );
}
