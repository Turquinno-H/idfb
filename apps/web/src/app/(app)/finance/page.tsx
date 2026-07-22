'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import type { PaginatedResponse } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { DataTable, type Column } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';

interface CashAccount {
  id: string;
  name: string;
  openingBalance: string;
  currency?: { code: string };
}

interface BankAccount {
  id: string;
  iban: string;
  openingBalance: string;
  bank?: { name: string };
  currency?: { code: string };
}

export default function FinancePage() {
  const { t } = useI18n();

  const { data: cash, isLoading: cashLoading } = useQuery({
    queryKey: ['finance', 'cash-accounts'],
    queryFn: () => api.get<PaginatedResponse<CashAccount>>('/finance/cash-accounts?limit=50'),
  });

  const { data: bank, isLoading: bankLoading } = useQuery({
    queryKey: ['finance', 'bank-accounts'],
    queryFn: () => api.get<PaginatedResponse<BankAccount>>('/finance/bank-accounts?limit=50'),
  });

  const cashColumns: Column<CashAccount>[] = [
    { key: 'name', header: t('common.name') },
    {
      key: 'openingBalance',
      header: 'Açılış Bakiyesi',
      render: (row) => formatCurrency(row.openingBalance, row.currency?.code ?? 'TRY'),
    },
  ];

  const bankColumns: Column<BankAccount>[] = [
    { key: 'bank', header: 'Banka', render: (row) => row.bank?.name ?? '-' },
    { key: 'iban', header: 'IBAN' },
    {
      key: 'openingBalance',
      header: 'Açılış Bakiyesi',
      render: (row) => formatCurrency(row.openingBalance, row.currency?.code ?? 'TRY'),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t('nav.finance')} />

      <Card>
        <CardHeader>
          <CardTitle>Kasa Hesapları</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={cashColumns}
            data={cash?.data ?? []}
            isLoading={cashLoading}
            rowKey={(row) => row.id}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banka Hesapları</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={bankColumns}
            data={bank?.data ?? []}
            isLoading={bankLoading}
            rowKey={(row) => row.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
