'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { PaginatedResponse, Product, StockItem, Warehouse } from '@/lib/types';
import { Button, Card, Input, Label, Select } from '@/components/ui';
import { DataTable, type Column } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { Modal } from '@/components/modal';

interface AdjustForm {
  warehouseId: string;
  productId: string;
  quantity: string;
  direction: 'IN' | 'OUT';
  unitCost: string;
}

const emptyForm: AdjustForm = {
  warehouseId: '',
  productId: '',
  quantity: '1',
  direction: 'IN',
  unitCost: '0',
};

export default function InventoryPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AdjustForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'stock'],
    queryFn: () => api.get<PaginatedResponse<StockItem>>('/inventory/stock?limit=100'),
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api.get<PaginatedResponse<Warehouse>>('/warehouses?limit=100'),
  });

  const { data: products } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => api.get<PaginatedResponse<Product>>('/products?limit=200'),
  });

  const adjustMutation = useMutation({
    mutationFn: (payload: AdjustForm) =>
      api.post('/inventory/adjustments', {
        warehouseId: payload.warehouseId,
        productId: payload.productId,
        quantity: Number(payload.quantity),
        direction: payload.direction,
        unitCost: payload.direction === 'IN' ? Number(payload.unitCost) : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setModalOpen(false);
      setForm(emptyForm);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Hata'),
  });

  const columns: Column<StockItem>[] = [
    { key: 'product', header: t('nav.products'), render: (row) => row.product?.name ?? '-' },
    { key: 'sku', header: t('product.sku'), render: (row) => row.product?.sku ?? '-' },
    { key: 'warehouse', header: t('inventory.warehouse'), render: (row) => row.warehouse?.name ?? '-' },
    {
      key: 'quantityOnHand',
      header: t('inventory.onHand'),
      render: (row) => formatNumber(row.quantityOnHand),
    },
    {
      key: 'averageCost',
      header: t('inventory.avgCost'),
      render: (row) => formatCurrency(row.averageCost),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('nav.inventory')}
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('common.create')}
          </Button>
        }
      />

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} rowKey={(row) => row.id} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('common.create')}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            adjustMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="warehouse">{t('inventory.warehouse')}</Label>
            <Select
              id="warehouse"
              value={form.warehouseId}
              onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
              required
            >
              <option value="">—</option>
              {warehouses?.data.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="product">{t('nav.products')}</Label>
            <Select
              id="product"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
            >
              <option value="">—</option>
              {products?.data.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="direction">Yön</Label>
              <Select
                id="direction"
                value={form.direction}
                onChange={(e) => setForm({ ...form, direction: e.target.value as 'IN' | 'OUT' })}
              >
                <option value="IN">Giriş</option>
                <option value="OUT">Çıkış</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Miktar</Label>
              <Input
                id="quantity"
                type="number"
                step="0.0001"
                min="0.0001"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="unitCost">{t('inventory.avgCost')}</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                value={form.unitCost}
                onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                disabled={form.direction === 'OUT'}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={adjustMutation.isPending}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
