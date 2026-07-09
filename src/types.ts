export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  barcode: string;
  price: number; // Sale price
  costPrice: number; // Purchase/Buy price
  stock: number;
  minStockAlert: number;
  rating: number;
  image: string;
  unit: string; // e.g., "علبة", "كجم", "كيس"
  isBestSeller?: boolean;
  isFrozen?: boolean;
  brandAr?: string;
  weight?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  nameAr: string;
  quantity: number;
  salePrice: number;
  costPrice: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  type: 'regular' | 'quick'; // Quick sale (without invoice) vs Regular
  items: TransactionItem[];
  subtotal: number;
  vat: number; // 14% VAT (if active)
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card';
  customerName?: string;
  timestamp: string;
}

export interface PurchaseItem {
  productId: string;
  nameAr: string;
  quantity: number;
  buyPrice: number;
}

export interface PurchaseOrder {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  timestamp: string;
}

export interface Supplier {
  id: string;
  nameAr: string;
  contact: string;
  company: string;
}
