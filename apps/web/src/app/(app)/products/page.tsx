'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import type { PaginatedResponse, Product, Unit } from '@/lib/types';
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
} from '@/components/ui';
import { DataTable, type Column } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { Modal } from '@/components/modal';

interface ProductForm {
  sku: string;
  name: string;
  unitId: string;
  salesPrice: string;
  purchasePrice: string;
}

const emptyForm: ProductForm = {
  sku: '',
  name: '',
  unitId: '',
  salesPrice: '0',
  purchasePrice: '0',
};

export default function ProductsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () =>
      api.get<PaginatedResponse<Product>>(
        `/products?limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      ),
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => api.get<PaginatedResponse<Unit>>('/units?limit=100'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: ProductForm) =>
      api.post('/products', {
        sku: payload.sku,
        name: payload.name,
        unitId: payload.unitId,
        salesPrice: Number(payload.salesPrice),
        purchasePrice: Number(payload.purchasePrice),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      setModalOpen(false);
      setForm(emptyForm);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Hata'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const columns: Column<Product>[] = [
    { key: 'sku', header: t('product.sku') },
    { key: 'name', header: t('common.name') },
    { key: 'unit', header: t('product.unit'), render: (row) => row.unit?.name ?? '-' },
    {
      key: 'salesPrice',
      header: t('product.salesPrice'),
      render: (row) => formatCurrency(row.salesPrice),
    },
    {
      key: 'isActive',
      header: '',
      render: (row) =>
        row.isActive ? (
          <Badge tone="success">Aktif</Badge>
        ) : (
          <Badge tone="destructive">Pasif</Badge>
        ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-right',
      render: (row) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('common.delete')}
          onClick={() => {
            if (window.confirm(t('common.confirmDelete'))) {
              deleteMutation.mutate(row.id);
            }
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('nav.products')}
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('common.create')}
          </Button>
        }
      />

      <Card className="mb-4 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} rowKey={(row) => row.id} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('common.create')}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="sku">{t('product.sku')}</Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="name">{t('common.name')}</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="unit">{t('product.unit')}</Label>
            <select
              id="unit"
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
              value={form.unitId}
              onChange={(e) => setForm({ ...form, unitId: e.target.value })}
              required
            >
              <option value="">—</option>
              {units?.data.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salesPrice">{t('product.salesPrice')}</Label>
              <Input
                id="salesPrice"
                type="number"
                step="0.01"
                value={form.salesPrice}
                onChange={(e) => setForm({ ...form, salesPrice: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="purchasePrice">{t('product.purchasePrice')}</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
