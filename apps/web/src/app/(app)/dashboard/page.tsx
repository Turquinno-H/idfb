'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Truck, Package, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { DashboardSummary, SalesTrendPoint } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { PageHeader } from '@/components/page-header';

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();

  const { data: summary } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.get<DashboardSummary>('/dashboard/summary'),
  });

  const { data: trend } = useQuery({
    queryKey: ['dashboard', 'sales-trend'],
    queryFn: () => api.get<SalesTrendPoint[]>('/dashboard/sales-trend?months=6'),
  });

  const maxTrend = trend ? Math.max(...trend.map((point) => point.total), 1) : 1;

  return (
    <div>
      <PageHeader title={t('dashboard.title')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('dashboard.customers')}
          value={formatNumber(summary?.counts.customers ?? 0)}
          icon={Users}
        />
        <StatCard
          label={t('dashboard.suppliers')}
          value={formatNumber(summary?.counts.suppliers ?? 0)}
          icon={Truck}
        />
        <StatCard
          label={t('dashboard.products')}
          value={formatNumber(summary?.counts.products ?? 0)}
          icon={Package}
        />
        <StatCard
          label={t('dashboard.openSalesOrders')}
          value={formatNumber(summary?.counts.openSalesOrders ?? 0)}
          icon={ShoppingCart}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.receivable')}</p>
              <p className="mt-1 text-2xl font-bold text-success">
                {formatCurrency(summary?.sales.receivable ?? 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-success" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.payable')}</p>
              <p className="mt-1 text-2xl font-bold text-destructive">
                {formatCurrency(summary?.purchasing.payable ?? 0)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-destructive" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.salesTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-2">
              {(trend ?? []).map((point) => (
                <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-accent"
                      style={{ height: `${Math.max((point.total / maxTrend) * 100, 2)}%` }}
                      title={formatCurrency(point.total)}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{point.month.slice(5)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.lowStock')}</CardTitle>
          </CardHeader>
          <CardContent>
            {summary && summary.lowStock.length > 0 ? (
              <ul className="space-y-2">
                {summary.lowStock.slice(0, 8).map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="font-medium text-warning">
                      {formatNumber(item.onHand)} / {formatNumber(item.minStockLevel)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t('dashboard.noLowStock')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
