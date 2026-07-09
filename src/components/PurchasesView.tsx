import React, { useState } from 'react';
import { Product, Supplier, PurchaseOrder, PurchaseItem } from '../types';
import { Truck, Plus, Trash2, Search, CheckCircle2, Sliders, DollarSign, RefreshCw } from 'lucide-react';

interface PurchasesViewProps {
  products: Product[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (order: PurchaseOrder) => void;
  addNewSupplier: (supplier: Supplier) => void;
}

export default function PurchasesView({
  products,
  suppliers,
  purchaseOrders,
  addPurchaseOrder,
  addNewSupplier
}: PurchasesViewProps) {
  // Active states for creating a new supply invoice
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [supplierInvoiceNum, setSupplierInvoiceNum] = useState('');
  
  // Cart for items being purchased from supplier
  const [purchaseCart, setPurchaseCart] = useState<{ product: Product; quantity: number; buyPrice: number }[]>([]);
  
  // Search and select product
  const [prodSearch, setProdSearch] = useState('');
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // New Supplier Form State
  const [newSupName, setNewSupName] = useState('');
  const [newSupCompany, setNewSupCompany] = useState('');
  const [newSupContact, setNewSupContact] = useState('');

  // Calculations
  const invoiceTotal = purchaseCart.reduce((sum, item) => sum + item.buyPrice * item.quantity, 0);

  // Filter products for adding to purchase invoice
  const searchedProducts = prodSearch
    ? products.filter(
        (p) =>
          p.nameAr.toLowerCase().includes(prodSearch.toLowerCase()) ||
          p.nameEn.toLowerCase().includes(prodSearch.toLowerCase()) ||
          p.barcode.includes(prodSearch)
      )
    : [];

  const handleAddProductToPurchase = (product: Product) => {
    // Check if already in purchase cart
    const existing = purchaseCart.find((item) => item.product.id === product.id);
    if (existing) {
      setPurchaseCart(
        purchaseCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setPurchaseCart([...purchaseCart, { product, quantity: 10, buyPrice: product.costPrice }]);
    }
    setProdSearch(''); // Clear search
  };

  const handleUpdatePurchaseItem = (productId: string, quantity: number, buyPrice: number) => {
    setPurchaseCart(
      purchaseCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, quantity), buyPrice: Math.max(0, buyPrice) }
          : item
      )
    );
  };

  const handleRemovePurchaseItem = (productId: string) => {
    setPurchaseCart(purchaseCart.filter((item) => item.product.id !== productId));
  };

  const handleSubmitPurchaseInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      alert('يرجى اختيار المورد أولاً');
      return;
    }
    if (purchaseCart.length === 0) {
      alert('يرجى إضافة سلع واحدة على الأقل لفاتورة التوريد');
      return;
    }
    if (!supplierInvoiceNum) {
      alert('يرجى كتابة رقم فاتورة المورد');
      return;
    }

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!supplier) return;

    const purchaseItems: PurchaseItem[] = purchaseCart.map((item) => ({
      productId: item.product.id,
      nameAr: item.product.nameAr,
      quantity: item.quantity,
      buyPrice: item.buyPrice
    }));

    const newOrder: PurchaseOrder = {
      id: 'po-' + Date.now(),
      invoiceNumber: supplierInvoiceNum,
      supplierName: supplier.nameAr,
      items: purchaseItems,
      total: invoiceTotal,
      timestamp: new Date().toISOString()
    };

    addPurchaseOrder(newOrder);

    // Reset Form State
    setPurchaseCart([]);
    setSupplierInvoiceNum('');
    alert(`✅ تم اعتماد فاتورة الشراء رقم (${supplierInvoiceNum}) بنجاح وتم توريد البضائع للمخزن وتحديث أسعار التكلفة!`);
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName || !newSupCompany) {
      alert('يرجى إدخال اسم المورد واسم الشركة على الأقل');
      return;
    }

    const newSup: Supplier = {
      id: 'sup-' + Date.now(),
      nameAr: newSupName,
      company: newSupCompany,
      contact: newSupContact || 'غير مسجل'
    };

    addNewSupplier(newSup);
    setSelectedSupplierId(newSup.id);
    
    // Reset states
    setNewSupName('');
    setNewSupCompany('');
    setNewSupContact('');
    setShowSupplierModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6" id="purchases-root-view">
      
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Truck className="text-brand-green" />
          <span>إدارة المشتريات وتوريد البضائع 🚚</span>
        </h2>
        <p className="text-xs text-gray-500">
          تسجيل فواتير الشراء الواردة من الشركات والمندوبين، توريد الكميات للمخازن، وتعديل أسعار التكلفة في الحسابات
        </p>
      </div>

      {/* Grid Layout: Right side new invoice form, Left side purchase records history */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RIGHT COLUMN: Create New Supply/Purchase Invoice (Takes 7 columns) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="font-extrabold text-sm text-brand-green flex items-center gap-1.5">
              <span>📝 فاتورة شراء / توريد جديدة</span>
            </h3>
            <span className="text-[10px] bg-emerald-50 text-brand-green font-bold px-2 py-0.5 rounded">نموذج قيد مخزني</span>
          </div>

          <form onSubmit={handleSubmitPurchaseInvoice} className="space-y-4">
            
            {/* Metadata Fields: Supplier & Invoice number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">المورّد الشاحن *</label>
                <div className="flex gap-1.5">
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameAr} ({s.company})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowSupplierModal(true)}
                    className="bg-brand-gold text-brand-green font-bold text-xs px-2.5 rounded hover:bg-amber-500 transition-colors"
                    title="تسجيل مورد جديد"
                  >
                    + مورد
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">رقم فاتورة الشراء الأصلية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: PINV-2026-908"
                  value={supplierInvoiceNum}
                  onChange={(e) => setSupplierInvoiceNum(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            {/* Product Selector Search Box */}
            <div className="relative">
              <label className="text-xs font-bold text-slate-700 block mb-1">بحث واختيار المنتج المراد توريده للمستودع *</label>
              <div className="relative">
                <span className="absolute right-3 top-2.5 text-gray-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الباركود لإضافة الصنف للفاتورة..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded pr-9 pl-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  id="purchase-prod-search"
                />
              </div>

              {/* Instant Search Results dropdown dropdown */}
              {prodSearch && (
                <div className="absolute right-0 left-0 bg-white border border-slate-200 rounded-lg shadow-lg z-30 max-h-56 overflow-y-auto mt-1 divide-y divide-slate-100">
                  {searchedProducts.length === 0 ? (
                    <p className="p-3 text-xs text-gray-400 text-center">لا توجد منتجات مطابقة للبحث</p>
                  ) : (
                    searchedProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleAddProductToPurchase(p)}
                        className="p-2.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{p.nameAr}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{p.nameEn} | باركود: {p.barcode}</p>
                        </div>
                        <span className="text-brand-green font-bold">سعر الشراء الحالي: {p.costPrice.toFixed(2)} ج.م</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected items table inside the purchasing invoice */}
            <div className="border border-slate-100 rounded-xl overflow-hidden mt-4">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500">
                    <th className="p-3">اسم الصنف</th>
                    <th className="p-3 text-center">الكمية المورّدة</th>
                    <th className="p-3 text-center">سعر الشراء للقطعة (التكلفة)</th>
                    <th className="p-3 text-center">الإجمالي الفرعي</th>
                    <th className="p-3 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseCart.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        سلة التوريد فارغة. ابحث عن السلع أعلاه وأضفها للبدء في قيد الفاتورة.
                      </td>
                    </tr>
                  ) : (
                    purchaseCart.map((item) => (
                      <tr key={item.product.id} className="hover:bg-slate-50/50">
                        
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{item.product.nameAr}</p>
                          <span className="text-[9px] text-gray-400">باركود: {item.product.barcode}</span>
                        </td>

                        {/* Quantity input */}
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdatePurchaseItem(item.product.id, Number(e.target.value), item.buyPrice)}
                            className="w-16 border rounded text-center py-1 font-bold focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-[10px] text-gray-400 mr-1">{item.product.unit}</span>
                        </td>

                        {/* Purchase Price input */}
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.buyPrice}
                            onChange={(e) => handleUpdatePurchaseItem(item.product.id, item.quantity, Number(e.target.value))}
                            className="w-20 border rounded text-center py-1 font-bold text-brand-green focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-[10px] text-gray-400 mr-1">ج.م</span>
                        </td>

                        {/* Subtotal */}
                        <td className="p-3 text-center font-bold text-slate-700">
                          {(item.buyPrice * item.quantity).toFixed(2)} ج.م
                        </td>

                        {/* Delete row */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePurchaseItem(item.product.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-slate-100 p-1 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Invoice Financial summary */}
            <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100 text-xs">
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold">صافي تكلفة فاتورة الشراء الواردة</p>
                <p className="text-lg font-black text-brand-green">{invoiceTotal.toFixed(2)} ج.م</p>
              </div>

              <button
                type="submit"
                disabled={purchaseCart.length === 0}
                className={`px-6 py-3 rounded-lg font-bold transition-all shadow ${
                  purchaseCart.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-brand-green hover:bg-brand-green-hover text-white shadow-md'
                }`}
                id="btn-confirm-purchase-order"
              >
                تأكيد واعتماد فاتورة التوريد للعهدة المخزنية 📥
              </button>
            </div>

          </form>
        </div>

        {/* LEFT COLUMN: Purchase Orders History Log (Takes 5 columns) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="font-extrabold text-sm text-slate-800">
              📜 سجل فواتير الشراء الواردة وتكلفة التوريد
            </h3>
            <span className="text-[10px] text-gray-400">آخر {purchaseOrders.length} فواتير معتمدة</span>
          </div>

          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {purchaseOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-300">
                <RefreshCw size={36} className="mx-auto mb-2 text-slate-200 animate-spin" />
                <p className="text-xs">لم يتم تسجيل فواتير شراء سابقة بعد</p>
              </div>
            ) : (
              purchaseOrders.map((order) => (
                <div key={order.id} className="border border-slate-100 rounded-xl p-3 hover:shadow-sm transition-all text-xs bg-slate-50/50">
                  <div className="flex justify-between items-center font-bold pb-2 border-b border-dashed border-slate-100">
                    <span className="text-brand-green">فاتورة: #{order.invoiceNumber}</span>
                    <span className="text-slate-400 text-[10px]">{new Date(order.timestamp).toLocaleString('ar-EG')}</span>
                  </div>
                  
                  <div className="py-2.5">
                    <p className="text-slate-500">المورد: <strong className="text-slate-700">{order.supplierName}</strong></p>
                    <div className="mt-1.5 space-y-1 pl-2">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-[11px] text-gray-600 flex justify-between">
                          <span>• {item.nameAr}</span>
                          <span>{item.quantity} وحدة × {item.buyPrice.toFixed(2)} ج.م</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px] font-extrabold">
                    <span className="text-slate-500">القيمة الإجمالية المدفوعة كاشير:</span>
                    <span className="text-brand-green text-sm">{order.total.toFixed(2)} ج.م</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Supplier Register Modal dialog */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl relative">
            <h3 className="text-base font-extrabold text-brand-green border-b pb-2 mb-4">
              ➕ إضافة وتسجيل مورد جديد بسجلات المحل
            </h3>

            <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المندوب المسؤول *</label>
                <input
                  type="text"
                  required
                  placeholder="أ/ حسام غالي"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم الشركة / العلامة التجارية *</label>
                <input
                  type="text"
                  required
                  placeholder="شركة عبور لاند للصناعات الغذائية"
                  value={newSupCompany}
                  onChange={(e) => setNewSupCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رقم هاتف المندوب للاتصال والمحاسبة</label>
                <input
                  type="text"
                  placeholder="010..."
                  value={newSupContact}
                  onChange={(e) => setNewSupContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold"
                >
                  إلغاء التراجع
                </button>
                <button
                  type="submit"
                  className="bg-brand-green text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-green-hover"
                >
                  تسجيل وحفظ المورد فورا
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
