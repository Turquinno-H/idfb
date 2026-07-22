'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PaginatedResponse } from '@/lib/types';
import { DataTable, type Column } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  hireDate: string;
  baseSalary: string;
  department?: { name: string } | null;
  position?: { title: string } | null;
  currency?: { code: string };
}

export default function HrPage() {
  const { t } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.get<PaginatedResponse<Employee>>('/employees?limit=50'),
  });

  const columns: Column<Employee>[] = [
    { key: 'employeeNumber', header: 'Sicil No' },
    {
      key: 'name',
      header: t('common.name'),
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'department', header: 'Departman', render: (row) => row.department?.name ?? '-' },
    { key: 'position', header: 'Pozisyon', render: (row) => row.position?.title ?? '-' },
    { key: 'hireDate', header: 'İşe Giriş', render: (row) => formatDate(row.hireDate) },
    {
      key: 'baseSalary',
      header: 'Maaş',
      render: (row) => formatCurrency(row.baseSalary, row.currency?.code ?? 'TRY'),
    },
  ];

  return (
    <div>
      <PageHeader title={t('nav.hr')} />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} rowKey={(row) => row.id} />
    </div>
  );
}
