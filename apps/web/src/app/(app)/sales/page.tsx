'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PaginatedResponse } from '@/lib/types';
import { Badge } from '@/components/ui';
import { DataTable, type Column } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';

interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  total: string;
  paidAmount: string;
  customer?: { name: string };
  currency?: { code: string };
}

const statusTone: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'accent'> = {
  DRAFT: 'default',
  APPROVED: 'accent',
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  OVERDUE: 'destructive',
  CANCELLED: 'destructive',
};

export default function SalesInvoicesPage() {
  const { t } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ['sales-invoices'],
    queryFn: () => api.get<PaginatedResponse<SalesInvoice>>('/sales-invoices?limit=50'),
  });

  const columns: Column<SalesInvoice>[] = [
    { key: 'invoiceNumber', header: 'No' },
    { key: 'customer', header: t('nav.customers'), render: (row) => row.customer?.name ?? '-' },
    { key: 'issueDate', header: 'Tarih', render: (row) => formatDate(row.issueDate) },
    {
      key: 'total',
      header: t('common.total'),
      render: (row) => formatCurrency(row.total, row.currency?.code ?? 'TRY'),
    },
    {
      key: 'status',
      header: '',
      render: (row) => <Badge tone={statusTone[row.status] ?? 'default'}>{row.status}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader title={t('nav.salesInvoices')} />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} rowKey={(row) => row.id} />
    </div>
  );
}
