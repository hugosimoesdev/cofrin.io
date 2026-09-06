import type { ColumnDef } from '@tanstack/react-table';
import type { TranslationKey } from '@/shared/lib';

export type ServiceStatus = {
  service: string;
  owner: string;
  environment: 'local' | 'quality' | 'production';
  status: 'online' | 'pending' | 'planned';
};

type Translate = (key: TranslationKey) => string;

const environmentLabelKeys: Record<ServiceStatus['environment'], TranslationKey> = {
  local: 'serviceStatus.environment.local',
  quality: 'serviceStatus.environment.quality',
  production: 'serviceStatus.environment.production',
};

const statusLabelKeys: Record<ServiceStatus['status'], TranslationKey> = {
  online: 'serviceStatus.status.online',
  pending: 'serviceStatus.status.pending',
  planned: 'serviceStatus.status.planned',
};

export function getServiceStatusColumns(t: Translate): ColumnDef<ServiceStatus>[] {
  return [
    {
      accessorKey: 'service',
      header: t('serviceStatus.columns.service'),
    },
    {
      accessorKey: 'owner',
      header: t('serviceStatus.columns.owner'),
    },
    {
      accessorKey: 'environment',
      header: t('serviceStatus.columns.environment'),
      cell: ({ row }) =>
        t(environmentLabelKeys[row.getValue<ServiceStatus['environment']>('environment')]),
    },
    {
      accessorKey: 'status',
      header: t('serviceStatus.columns.status'),
      cell: ({ row }) => {
        const status = row.getValue<ServiceStatus['status']>('status');

        return (
          <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">
            {t(statusLabelKeys[status])}
          </span>
        );
      },
    },
  ];
}

export const serviceStatusData: ServiceStatus[] = [
  {
    service: 'Quarkus API',
    owner: 'Backend',
    environment: 'local',
    status: 'online',
  },
  {
    service: 'PostgreSQL',
    owner: 'Persistence',
    environment: 'local',
    status: 'online',
  },
  {
    service: 'Quality deploy',
    owner: 'Platform',
    environment: 'quality',
    status: 'planned',
  },
];
