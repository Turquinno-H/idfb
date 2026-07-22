'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui';
import { ThemeToggle, LanguageToggle } from '@/components/toggles';

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const initials =
    user?.email
      ?.split('@')[0]
      ?.slice(0, 2)
      ?.toUpperCase() ?? '??';

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="text-sm text-muted-foreground">{user?.email}</div>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
          {initials}
        </div>
        <Button variant="ghost" size="icon" aria-label={t('auth.logout')} onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
