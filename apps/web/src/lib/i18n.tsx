'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'tr' | 'en';

type Dictionary = Record<string, string>;

const tr: Dictionary = {
  'app.name': 'IDFB ERP',
  'app.tagline': 'Türk KOBİ’leri için kurumsal ERP',
  'auth.login': 'Giriş Yap',
  'auth.register': 'Kayıt Ol',
  'auth.email': 'E-posta',
  'auth.password': 'Şifre',
  'auth.firstName': 'Ad',
  'auth.lastName': 'Soyad',
  'auth.companyName': 'Şirket Adı',
  'auth.taxNumber': 'Vergi / TC No',
  'auth.logout': 'Çıkış Yap',
  'auth.loginTitle': 'Hesabınıza giriş yapın',
  'auth.registerTitle': 'Yeni şirket oluşturun',
  'auth.noAccount': 'Hesabınız yok mu?',
  'auth.haveAccount': 'Zaten hesabınız var mı?',
  'auth.selectCompany': 'Şirket seçin',
  'nav.dashboard': 'Kontrol Paneli',
  'nav.crm': 'CRM',
  'nav.customers': 'Müşteriler',
  'nav.suppliers': 'Tedarikçiler',
  'nav.catalog': 'Katalog',
  'nav.products': 'Ürünler',
  'nav.inventory': 'Stok',
  'nav.sales': 'Satış',
  'nav.salesInvoices': 'Satış Faturaları',
  'nav.purchasing': 'Satın Alma',
  'nav.purchaseOrders': 'Satın Alma Siparişleri',
  'nav.finance': 'Finans',
  'nav.accounting': 'Muhasebe',
  'nav.hr': 'İnsan Kaynakları',
  'nav.settings': 'Ayarlar',
  'dashboard.title': 'Kontrol Paneli',
  'dashboard.customers': 'Müşteriler',
  'dashboard.suppliers': 'Tedarikçiler',
  'dashboard.products': 'Ürünler',
  'dashboard.openSalesOrders': 'Açık Satış Siparişleri',
  'dashboard.receivable': 'Alacaklar',
  'dashboard.payable': 'Borçlar',
  'dashboard.salesTrend': 'Satış Trendi',
  'dashboard.lowStock': 'Kritik Stok',
  'dashboard.noLowStock': 'Kritik stokta ürün yok',
  'common.search': 'Ara...',
  'common.create': 'Yeni',
  'common.edit': 'Düzenle',
  'common.delete': 'Sil',
  'common.save': 'Kaydet',
  'common.cancel': 'İptal',
  'common.actions': 'İşlemler',
  'common.loading': 'Yükleniyor...',
  'common.noData': 'Kayıt bulunamadı',
  'common.confirmDelete': 'Bu kaydı silmek istediğinize emin misiniz?',
  'common.code': 'Kod',
  'common.name': 'Ad',
  'common.email': 'E-posta',
  'common.phone': 'Telefon',
  'common.total': 'Toplam',
  'product.sku': 'Stok Kodu',
  'product.salesPrice': 'Satış Fiyatı',
  'product.purchasePrice': 'Alış Fiyatı',
  'product.unit': 'Birim',
  'inventory.onHand': 'Mevcut',
  'inventory.avgCost': 'Ort. Maliyet',
  'inventory.warehouse': 'Depo',
  'customer.taxNumber': 'Vergi No',
  'customer.creditLimit': 'Kredi Limiti',
};

const en: Dictionary = {
  'app.name': 'IDFB ERP',
  'app.tagline': 'Enterprise ERP for Turkish SMEs',
  'auth.login': 'Sign In',
  'auth.register': 'Sign Up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.firstName': 'First name',
  'auth.lastName': 'Last name',
  'auth.companyName': 'Company name',
  'auth.taxNumber': 'Tax / National ID',
  'auth.logout': 'Sign Out',
  'auth.loginTitle': 'Sign in to your account',
  'auth.registerTitle': 'Create a new company',
  'auth.noAccount': "Don't have an account?",
  'auth.haveAccount': 'Already have an account?',
  'auth.selectCompany': 'Select a company',
  'nav.dashboard': 'Dashboard',
  'nav.crm': 'CRM',
  'nav.customers': 'Customers',
  'nav.suppliers': 'Suppliers',
  'nav.catalog': 'Catalog',
  'nav.products': 'Products',
  'nav.inventory': 'Inventory',
  'nav.sales': 'Sales',
  'nav.salesInvoices': 'Sales Invoices',
  'nav.purchasing': 'Purchasing',
  'nav.purchaseOrders': 'Purchase Orders',
  'nav.finance': 'Finance',
  'nav.accounting': 'Accounting',
  'nav.hr': 'Human Resources',
  'nav.settings': 'Settings',
  'dashboard.title': 'Dashboard',
  'dashboard.customers': 'Customers',
  'dashboard.suppliers': 'Suppliers',
  'dashboard.products': 'Products',
  'dashboard.openSalesOrders': 'Open Sales Orders',
  'dashboard.receivable': 'Receivables',
  'dashboard.payable': 'Payables',
  'dashboard.salesTrend': 'Sales Trend',
  'dashboard.lowStock': 'Low Stock',
  'dashboard.noLowStock': 'No products below minimum stock',
  'common.search': 'Search...',
  'common.create': 'New',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.actions': 'Actions',
  'common.loading': 'Loading...',
  'common.noData': 'No records found',
  'common.confirmDelete': 'Are you sure you want to delete this record?',
  'common.code': 'Code',
  'common.name': 'Name',
  'common.email': 'Email',
  'common.phone': 'Phone',
  'common.total': 'Total',
  'product.sku': 'SKU',
  'product.salesPrice': 'Sales Price',
  'product.purchasePrice': 'Purchase Price',
  'product.unit': 'Unit',
  'inventory.onHand': 'On Hand',
  'inventory.avgCost': 'Avg. Cost',
  'inventory.warehouse': 'Warehouse',
  'customer.taxNumber': 'Tax No',
  'customer.creditLimit': 'Credit Limit',
};

const dictionaries: Record<Locale, Dictionary> = { tr, en };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const LOCALE_KEY = 'idfb.locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('tr');

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (stored === 'tr' || stored === 'en') {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_KEY, next);
  }, []);

  const t = useCallback(
    (key: string) => dictionaries[locale][key] ?? key,
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
