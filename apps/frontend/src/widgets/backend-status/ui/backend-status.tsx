import { useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';

import { fetchGreeting } from '@/entities/backend-status';
import { getApiErrorMessage } from '@/shared/api';
import { Button } from '@/shared/ui/button';

type ApiState =
  | { status: 'loading' }
  | { status: 'ready'; message: string }
  | { status: 'error'; message: string };

export function BackendStatus() {
  const [apiState, setApiState] = useState<ApiState>({ status: 'loading' });

  function checkBackend() {
    setApiState({ status: 'loading' });
    fetchGreeting()
      .then((greeting) => {
        setApiState({ status: 'ready', message: greeting.message });
      })
      .catch((error: unknown) => {
        const message = getApiErrorMessage(error, 'Unknown backend error');
        setApiState({ status: 'error', message });
      });
  }

  useEffect(() => {
    checkBackend();
  }, []);

  const isLoading = apiState.status === 'loading';

  return (
    <div
      className={`api-status api-status--${apiState.status} mb-6 inline-flex min-h-12 items-center gap-3 rounded-lg border border-[#172026]/10 bg-white/70 px-4 py-3 text-[#263238] shadow-[0_18px_42px_rgba(23,32,38,0.1)] max-[560px]:w-full max-[560px]:items-start`}
    >
      <span
        className="status-dot mt-[0.45rem] inline-block size-2.5 shrink-0 rounded-full"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        {isLoading && 'Checking backend connection...'}
        {apiState.status === 'ready' && apiState.message}
        {apiState.status === 'error' && apiState.message}
      </span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={checkBackend}
        disabled={isLoading}
        aria-label="Recheck backend connection"
      >
        <RotateCw className={isLoading ? 'animate-spin' : undefined} />
        Recheck
      </Button>
    </div>
  );
}
