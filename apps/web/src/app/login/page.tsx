'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { ApiError } from '@/lib/api';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from '@/components/ui';
import { ThemeToggle, LanguageToggle } from '@/components/toggles';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companies, setCompanies] = useState<{ id: string; name: string }[] | null>(null);
  const [companyId, setCompanyId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email, password, companyId || undefined);
      if (result) {
        setCompanies(result.companies);
        setCompanyId(result.companies[0]?.id ?? '');
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Giriş başarısız');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 text-2xl font-bold text-accent">{t('app.name')}</div>
          <CardTitle>{t('auth.loginTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('app.tagline')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {companies && companies.length > 1 && (
              <div>
                <Label htmlFor="company">{t('auth.selectCompany')}</Label>
                <Select id="company" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {t('auth.login')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link href="/register" className="font-medium text-accent hover:underline">
              {t('auth.register')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
