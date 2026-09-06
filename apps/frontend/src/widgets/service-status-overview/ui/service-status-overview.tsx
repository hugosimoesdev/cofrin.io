import { useMemo } from 'react';

import { useI18n } from '@/shared/lib';
import { DataTable } from '@/shared/ui/data-table';

import { getServiceStatusColumns, serviceStatusData } from '../model/service-status';

export function ServiceStatusOverview() {
  const { locale, t } = useI18n();
  const columns = useMemo(() => getServiceStatusColumns(t), [locale, t]);

  return <DataTable columns={columns} data={serviceStatusData} />;
}
