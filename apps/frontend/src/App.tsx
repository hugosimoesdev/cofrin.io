import { useEffect, useState } from 'react';
import { fetchGreeting } from './api';
import './App.css';

type ApiState =
  | { status: 'loading' }
  | { status: 'ready'; message: string }
  | { status: 'error'; message: string };

export function App() {
  const [apiState, setApiState] = useState<ApiState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    fetchGreeting()
      .then((greeting) => {
        if (active) {
          setApiState({ status: 'ready', message: greeting.message });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          const message = error instanceof Error ? error.message : 'Unknown backend error';
          setApiState({ status: 'error', message });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="status-panel" aria-labelledby="app-title">
        <p className="eyebrow">Quarkus + Vite monorepo</p>
        <h1 id="app-title">cofrin.io</h1>
        <div className={`api-status api-status--${apiState.status}`}>
          <span className="status-dot" aria-hidden="true" />
          <span>
            {apiState.status === 'loading' && 'Checking backend connection...'}
            {apiState.status === 'ready' && apiState.message}
            {apiState.status === 'error' && apiState.message}
          </span>
        </div>
      </section>
    </main>
  );
}
