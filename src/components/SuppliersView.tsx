import React, { useState } from 'react';
import { Supplier, PurchaseOrder } from '../types';
import { Users, Plus, Phone, Award, Truck, Briefcase } from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  addNewSupplier: (supplier: Supplier) => void;
}

export default function SuppliersView({
  suppliers,
  purchaseOrders,
  addNewSupplier
}: SuppliersViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [supName, setSupName] = useState('');
  const [supCompany, setSupCompany] = useState('');
  const [supContact, setSupContact] = useState('');

  const handleCreateSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supCompany) {
      alert('يرجى إدخال اسم المندوب واسم الشركة على الأقل');
      return;
    }

    const newSup: Supplier = {
      id: 'sup-' + Date.now(),
      nameAr: supName,
      company: supCompany,
      contact: supContact || 'غير مسجل'
    };

    addNewSupplier(newSup);

    // Reset Form
    setSupName('');
    setSupCompany('');
    setSupContact('');
    setShowAddForm(false);
    alert('✅ تم تسجيل المورد الجديد بنجاح!');
  };

  // Helper to count purchase invoices per supplier
  const getOrdersCountForSupplier = (supplierName: string) => {
    return purchaseOrders.filter(
      (order) => order.supplierName.toLowerCase() === supplierName.toLowerCase()
    ).length;
  };

  // Helper to calculate total business/purchases value per supplier
  const getPurchasesTotalForSupplier = (supplierName: string) => {
    return purchaseOrders
      .filter((order) => order.supplierName.toLowerCase() === supplierName.toLowerCase())
      .reduce((sum, order) => sum + order.total, 0);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6" id="suppliers-root-view">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Users className="text-brand-green" />
            <span>إدارة الموردين والشركات الشاحنة 👥</span>
          </h2>
          <p className="text-xs text-gray-500">
            بيانات جهات الاتصال لمندوبي شركات الأغذية والمشروبات، ومراجعة حجم التوريد المالي لكل جهة
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition-all self-stretch md:self-auto justify-center"
          id="btn-toggle-supplier-form"
        >
          <Plus size={16} />
          <span>تسجيل مورد جديد</span>
        </button>
      </div>

      {/* Supplier Register Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleCreateSupplierSubmit} className="bg-white border-2 border-emerald-500 rounded-xl p-5 shadow-lg max-w-xl space-y-4 text-xs transition-all" id="supplier-form-container">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="font-extrabold text-brand-green">➕ تسجيل مورد جديد في قاعدة البيانات</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-red-500"
            >
              إغلاق ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">اسم المندوب المسؤول *</label>
              <input
                type="text"
                required
                placeholder="مثال: أ/ حسام البدر"
                value={supName}
                onChange={(e) => setSupName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">اسم الشركة / المصنع المورد *</label>
              <input
                type="text"
                required
                placeholder="مثال: شركة المراعي مصر"
                value={supCompany}
                onChange={(e) => setSupCompany(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">رقم الهاتف للاتصال والمطالبات المالية</label>
              <input
                type="text"
                placeholder="010..."
                value={supContact}
                onChange={(e) => setSupContact(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-mono focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="bg-brand-green text-white text-xs font-bold px-4 py-2 rounded-lg"
              id="btn-save-supplier"
            >
              حفظ المورد بسجل الحسابات
            </button>
          </div>
        </form>
      )}

      {/* Suppliers Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="suppliers-cards-grid">
        {suppliers.map((sup) => {
          const ordersCount = getOrdersCountForSupplier(sup.nameAr);
          const businessVolume = getPurchasesTotalForSupplier(sup.nameAr);

          return (
            <div key={sup.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all space-y-4" id={`supplier-card-${sup.id}`}>
              {/* Header: Company Name & Badge */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-emerald-50 text-brand-green rounded-lg flex items-center justify-center">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 leading-tight">{sup.company}</h3>
                    <p className="text-[11px] text-gray-400">مندوب الشركة: {sup.nameAr}</p>
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                  مورّد نشط
                </span>
              </div>

              {/* Contact info */}
              <div className="bg-slate-50 rounded-lg p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Phone size={13} className="text-gray-400" />
                  <span className="font-mono font-bold">{sup.contact}</span>
                </div>
                <a
                  href={`tel:${sup.contact}`}
                  className="text-brand-green font-bold text-[10px] hover:underline"
                >
                  اتصال هاتفي
                </a>
              </div>

              {/* Business Stats with supplier */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 text-center">
                <div className="bg-emerald-50/40 p-2 rounded-lg">
                  <p className="text-[9px] text-gray-400 font-bold">فواتير التوريد</p>
                  <p className="text-sm font-extrabold text-slate-700">{ordersCount} فواتير</p>
                </div>
                <div className="bg-emerald-50/40 p-2 rounded-lg">
                  <p className="text-[9px] text-gray-400 font-bold">حجم الأعمال الإجمالي</p>
                  <p className="text-sm font-extrabold text-brand-green">{businessVolume.toFixed(2)} ج.م</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
