'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? '/dashboard' : '/login');
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      <span>IDFB ERP…</span>
    </div>
  );
}
