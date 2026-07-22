export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CompanyChoice {
  companies: { id: string; name: string }[];
}

export interface AuthUser {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
  companyId: string | null;
  companyMemberId: string | null;
  permissions: string[];
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  type: string;
  salesPrice: string;
  purchasePrice: string;
  isActive: boolean;
  unit?: Unit;
  category?: { id: string; name: string } | null;
  brand?: { id: string; name: string } | null;
  currency?: Currency;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  type: string;
  taxNumber: string | null;
  email: string | null;
  phone: string | null;
  creditLimit: string;
  currency?: Currency;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  type: string;
  taxNumber: string | null;
  email: string | null;
  phone: string | null;
  currency?: Currency;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: string;
  isActive: boolean;
  branch?: { id: string; name: string } | null;
}

export interface StockItem {
  id: string;
  quantityOnHand: string;
  quantityReserved: string;
  averageCost: string;
  product?: { id: string; name: string; sku: string; unit?: Unit };
  warehouse?: { id: string; name: string };
}

export interface DashboardSummary {
  counts: {
    customers: number;
    suppliers: number;
    products: number;
    openSalesOrders: number;
    openPurchaseOrders: number;
  };
  sales: { invoiceTotal: number; collectedTotal: number; receivable: number };
  purchasing: { invoiceTotal: number; paidTotal: number; payable: number };
  lowStock: { productId: string; name: string; onHand: number; minStockLevel: number }[];
}

export interface SalesTrendPoint {
  month: string;
  total: number;
}
