'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import type { PaginatedResponse, Supplier } from '@/lib/types';
import { Button, Card, Input, Label } from '@/components/ui';
import { DataTable, type Column } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { Modal } from '@/components/modal';

interface SupplierForm {
  name: string;
  taxNumber: string;
  email: string;
  phone: string;
}

const emptyForm: SupplierForm = { name: '', taxNumber: '', email: '', phone: '' };

export default function SuppliersPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', search],
    queryFn: () =>
      api.get<PaginatedResponse<Supplier>>(
        `/suppliers?limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      ),
  });

  const createMutation = useMutation({
    mutationFn: (payload: SupplierForm) =>
      api.post('/suppliers', {
        name: payload.name,
        taxNumber: payload.taxNumber || undefined,
        email: payload.email || undefined,
        phone: payload.phone || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setModalOpen(false);
      setForm(emptyForm);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Hata'),
  });

  const columns: Column<Supplier>[] = [
    { key: 'code', header: t('common.code') },
    { key: 'name', header: t('common.name') },
    { key: 'taxNumber', header: t('customer.taxNumber'), render: (row) => row.taxNumber ?? '-' },
    { key: 'phone', header: t('common.phone'), render: (row) => row.phone ?? '-' },
    { key: 'email', header: t('common.email'), render: (row) => row.email ?? '-' },
  ];

  return (
    <div>
      <PageHeader
        title={t('nav.suppliers')}
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
            <Label htmlFor="name">{t('common.name')}</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="taxNumber">{t('customer.taxNumber')}</Label>
            <Input
              id="taxNumber"
              value={form.taxNumber}
              onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">{t('common.phone')}</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
