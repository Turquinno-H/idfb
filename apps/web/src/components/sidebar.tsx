'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  Warehouse,
  ShoppingCart,
  Receipt,
  Wallet,
  BookOpen,
  UserCog,
  Settings,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/customers', labelKey: 'nav.customers', icon: Users },
  { href: '/suppliers', labelKey: 'nav.suppliers', icon: Truck },
  { href: '/products', labelKey: 'nav.products', icon: Package },
  { href: '/inventory', labelKey: 'nav.inventory', icon: Warehouse },
  { href: '/sales', labelKey: 'nav.salesInvoices', icon: Receipt },
  { href: '/purchasing', labelKey: 'nav.purchaseOrders', icon: ShoppingCart },
  { href: '/finance', labelKey: 'nav.finance', icon: Wallet },
  { href: '/accounting', labelKey: 'nav.accounting', icon: BookOpen },
  { href: '/hr', labelKey: 'nav.hr', icon: UserCog },
  { href: '/settings', labelKey: 'nav.settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
        <span className="text-xl font-bold text-white">IDFB ERP</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-accent text-white'
                  : 'text-sidebar-foreground hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
