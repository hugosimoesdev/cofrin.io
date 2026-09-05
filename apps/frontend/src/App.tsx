import { useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { RotateCw } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { fetchGreeting } from './api';
import './App.css';

type ApiState =
  | { status: 'loading' }
  | { status: 'ready'; message: string }
  | { status: 'error'; message: string };

type ServiceStatus = {
  service: string;
  owner: string;
  environment: 'Local' | 'Quality' | 'Production';
  status: 'Online' | 'Pending' | 'Planned';
};

const serviceColumns: ColumnDef<ServiceStatus>[] = [
  {
    accessorKey: 'service',
    header: 'Service',
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
  },
  {
    accessorKey: 'environment',
    header: 'Environment',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue<ServiceStatus['status']>('status');

      return <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">{status}</span>;
    },
  },
];

const serviceData: ServiceStatus[] = [
  {
    service: 'Quarkus API',
    owner: 'Backend',
    environment: 'Local',
    status: 'Online',
  },
  {
    service: 'PostgreSQL',
    owner: 'Persistence',
    environment: 'Local',
    status: 'Online',
  },
  {
    service: 'Quality deploy',
    owner: 'Platform',
    environment: 'Quality',
    status: 'Planned',
  },
];

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
      <section className="w-full max-w-[840px]" aria-labelledby="app-title">
        <p className="mb-3 text-xs font-bold uppercase text-[#346657]">
          Quarkus + Vite monorepo
        </p>
        <h1
          id="app-title"
          className="mb-7 text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] text-[#172026]"
        >
          cofrin.io
        </h1>
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
        <DataTable columns={serviceColumns} data={serviceData} />
      </section>
    </main>
  );
}
