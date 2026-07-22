'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui';
import { PageHeader } from '@/components/page-header';

interface CompanyProfile {
  id: string;
  name: string;
  legalName: string | null;
  taxNumber: string;
  taxOffice: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  baseCurrency?: { code: string };
}

export default function SettingsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', legalName: '', taxOffice: '', city: '', phone: '', email: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['company-profile'],
    queryFn: () => api.get<CompanyProfile>('/settings/company'),
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        legalName: data.legalName ?? '',
        taxOffice: data.taxOffice ?? '',
        city: data.city ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: typeof form) => api.patch('/settings/company', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      setMessage('Kaydedildi');
      setError(null);
      setTimeout(() => setMessage(null), 2000);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Hata'),
  });

  return (
    <div>
      <PageHeader title={t('nav.settings')} />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Şirket Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate(form);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">{t('auth.companyName')}</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="legalName">Ticari Ünvan</Label>
              <Input
                id="legalName"
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                <Input
                  id="taxOffice"
                  value={form.taxOffice}
                  onChange={(e) => setForm({ ...form, taxOffice: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="city">Şehir</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">{t('common.phone')}</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            {message && <p className="text-sm text-success">{message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={updateMutation.isPending}>
              {t('common.save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
