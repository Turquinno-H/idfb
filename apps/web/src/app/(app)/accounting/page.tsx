'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import type { PaginatedResponse } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { DataTable, type Column } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface TrialBalanceRow {
  accountId: string;
  code: string;
  name: string;
  debit: number;
  credit: number;
  balance: number;
}

interface TrialBalance {
  accounts: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
}

export default function AccountingPage() {
  const { t } = useI18n();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get<PaginatedResponse<Account>>('/accounts?limit=100'),
  });

  const { data: trialBalance } = useQuery({
    queryKey: ['trial-balance'],
    queryFn: () => api.get<TrialBalance>('/journal-entries/trial-balance'),
  });

  const accountColumns: Column<Account>[] = [
    { key: 'code', header: t('common.code') },
    { key: 'name', header: t('common.name') },
    { key: 'type', header: 'Tür' },
  ];

  const tbColumns: Column<TrialBalanceRow>[] = [
    { key: 'code', header: t('common.code') },
    { key: 'name', header: t('common.name') },
    { key: 'debit', header: 'Borç', render: (row) => formatCurrency(row.debit) },
    { key: 'credit', header: 'Alacak', render: (row) => formatCurrency(row.credit) },
    { key: 'balance', header: 'Bakiye', render: (row) => formatCurrency(row.balance) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t('nav.accounting')} />

      <Card>
        <CardHeader>
          <CardTitle>Hesap Planı</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={accountColumns}
            data={accounts?.data ?? []}
            isLoading={isLoading}
            rowKey={(row) => row.id}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mizan</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tbColumns}
            data={trialBalance?.accounts ?? []}
            rowKey={(row) => row.accountId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
