import type { ColumnDef } from '@tanstack/react-table';

export type ServiceStatus = {
  service: string;
  owner: string;
  environment: 'Local' | 'Quality' | 'Production';
  status: 'Online' | 'Pending' | 'Planned';
};

export const serviceStatusColumns: ColumnDef<ServiceStatus>[] = [
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

export const serviceStatusData: ServiceStatus[] = [
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
