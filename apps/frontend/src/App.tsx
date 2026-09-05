import { useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { fetchGreeting } from './api';
import './App.css';

type ApiState =
  | { status: 'loading' }
  | { status: 'ready'; message: string }
  | { status: 'error'; message: string };

export function App() {
  const [apiState, setApiState] = useState<ApiState>({ status: 'loading' });

  function checkBackend() {
    setApiState({ status: 'loading' });
    fetchGreeting()
      .then((greeting) => {
        setApiState({ status: 'ready', message: greeting.message });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unknown backend error';
        setApiState({ status: 'error', message });
      });
  }

  useEffect(() => {
    checkBackend();
  }, []);

  const isLoading = apiState.status === 'loading';

  return (
    <main className="app-shell flex min-h-svh items-center p-8 max-[560px]:items-start max-[560px]:px-5 max-[560px]:py-10">
      <section className="max-w-[720px]" aria-labelledby="app-title">
        <p className="mb-3 text-xs font-bold uppercase text-[#346657]">Quarkus + Vite monorepo</p>
        <h1 id="app-title" className="mb-7 text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] text-[#172026]">
          cofrin.io
        </h1>
        <div className={`api-status api-status--${apiState.status} inline-flex min-h-12 items-center gap-3 rounded-lg border border-[#172026]/10 bg-white/70 px-4 py-3 text-[#263238] shadow-[0_18px_42px_rgba(23,32,38,0.1)] max-[560px]:w-full max-[560px]:items-start`}>
          <span className="status-dot mt-[0.45rem] inline-block size-2.5 shrink-0 rounded-full" aria-hidden="true" />
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
      </section>
    </main>
  );
}
