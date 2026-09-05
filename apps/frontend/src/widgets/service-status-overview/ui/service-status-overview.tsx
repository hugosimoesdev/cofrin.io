import { DataTable } from '@/shared/ui/data-table';

import { serviceStatusColumns, serviceStatusData } from '../model/service-status';

export function ServiceStatusOverview() {
  return <DataTable columns={serviceStatusColumns} data={serviceStatusData} />;
}
