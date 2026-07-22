'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';
import type { PaginatedResponse } from '@/lib/types';
import { Badge } from '@/components/ui';
import { DataTable, type Column } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  status: string;
  orderDate: string;
  supplier?: { name: string };
  warehouse?: { name: string };
}

const statusTone: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'accent'> = {
  DRAFT: 'default',
  CONFIRMED: 'accent',
  PARTIALLY_RECEIVED: 'warning',
  RECEIVED: 'success',
  CANCELLED: 'destructive',
};

export default function PurchaseOrdersPage() {
  const { t } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => api.get<PaginatedResponse<PurchaseOrder>>('/purchase-orders?limit=50'),
  });

  const columns: Column<PurchaseOrder>[] = [
    { key: 'orderNumber', header: 'No' },
    { key: 'supplier', header: t('nav.suppliers'), render: (row) => row.supplier?.name ?? '-' },
    { key: 'warehouse', header: t('inventory.warehouse'), render: (row) => row.warehouse?.name ?? '-' },
    { key: 'orderDate', header: 'Tarih', render: (row) => formatDate(row.orderDate) },
    {
      key: 'status',
      header: '',
      render: (row) => <Badge tone={statusTone[row.status] ?? 'default'}>{row.status}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader title={t('nav.purchaseOrders')} />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} rowKey={(row) => row.id} />
    </div>
  );
}
