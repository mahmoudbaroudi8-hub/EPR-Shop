import React from 'react';
import { Transaction, PurchaseOrder, Supplier, Product } from '../types';
import { DollarSign, FileText, CheckCircle, TrendingUp, ArrowDownRight, ArrowUpRight, Award, Percent, Printer, Users, Layers, ShoppingBag, ShieldCheck } from 'lucide-react';

interface AccountingViewProps {
  transactions: Transaction[];
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  products: Product[];
  reprintInvoice: (tx: Transaction) => void;
}

export default function AccountingView({
  transactions,
  purchaseOrders,
  suppliers,
  products,
  reprintInvoice
}: AccountingViewProps) {
  // Financial Mathematics for highly experienced Egyptian Accountant
  
  // 1. Total sales revenues
  const totalSalesRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
  
  // 2. Cost of Goods Sold (COGS) - تكلفة البضاعة المباعة
  // Calculates real profits based on exact cost prices when sold
  const totalCOGS = transactions.reduce((sum, tx) => {
    return sum + tx.items.reduce((itemSum, item) => itemSum + (item.costPrice * item.quantity), 0);
  }, 0);

  // 3. Gross Profit (مجمل الربح)
  const grossProfit = totalSalesRevenue - totalCOGS;
  const profitMarginPercent = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;

  // 4. VAT Collected (14% ضريبة القيمة المضافة المصرية)
  const totalVATCollected = transactions.reduce((sum, tx) => sum + tx.vat, 0);

  // 5. Total Purchases Expense
  const totalPurchasesExpense = purchaseOrders.reduce((sum, order) => sum + order.total, 0);

  // 6. Cash safe vs Card Safe
  const cashSales = transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0);
  const cardSales = transactions.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.total, 0);
  
  // Real Safe Balance = Starting Cash + Cash Sales - Cash Purchases (assuming purchases are paid cash from drawer)
  const cashDrawerBalance = Math.max(0, 5000 + cashSales - totalPurchasesExpense); // Starting 5000 EGP cash float

  // 7. Inventory asset valuation
  const inventoryAssetValuationCost = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6" id="accounting-root-view">
      
      {/* 1. Header block */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-brand-green" />
            <span>لوحة التقارير والتدقيق المحاسبي المتقدم 📊</span>
          </h2>
          <p className="text-xs text-gray-500">
            مصممة ومراجعة بواسطة خبير محاسبي مصري. تشمل القوائم المالية، حساب تكلفة المبيعات (COGS)، ضريبة القيمة المضافة، وصافي هامش الأرباح.
          </p>
        </div>
        
        <div className="flex gap-2">
          <span className="bg-emerald-50 text-brand-green text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
            ضريبة المبيعات النشطة: <strong>14% (قيمة مضافة)</strong>
          </span>
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg">
            العملة: <strong>جنيه مصري (ج.م)</strong>
          </span>
        </div>
      </div>

      {/* 2. Top Accounting KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="accounting-kpi-grid">
        
        {/* Total Revenues */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400">إجمالي إيرادات المبيعات</span>
            <span className="p-1 rounded bg-emerald-50 text-brand-green">
              <ArrowUpRight size={14} />
            </span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">{totalSalesRevenue.toFixed(2)} ج.م</h3>
            <p className="text-[10px] text-gray-400">منها {cashSales.toFixed(2)} ج.م نقدي كاشير</p>
          </div>
        </div>

        {/* Cost of Goods Sold - COGS */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400">تكلفة البضاعة المباعة (COGS)</span>
            <span className="p-1 rounded bg-red-50 text-red-500">
              <ArrowDownRight size={14} />
            </span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">{totalCOGS.toFixed(2)} ج.م</h3>
            <p className="text-[10px] text-gray-400">القيمة الأصلية للسلع قبل بيعها</p>
          </div>
        </div>

        {/* Net Profit Margin */}
        <div className="bg-white border border-emerald-100 p-4 rounded-xl shadow-sm space-y-2 bg-gradient-to-br from-emerald-50/20 to-white">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-emerald-800">صافي ربح المبيعات الكلي</span>
            <span className="p-1 rounded bg-brand-green text-white">
              <Percent size={12} />
            </span>
          </div>
          <div>
            <h3 className="text-xl font-black text-brand-green">+{grossProfit.toFixed(2)} ج.م</h3>
            <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded inline-block">
              هامش ربح: {profitMarginPercent.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Cash Safe Balance */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400">صندوق الكاش الفعلي (الخزينة)</span>
            <span className="p-1 rounded bg-amber-50 text-brand-gold">
              <TrendingUp size={14} />
            </span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">{cashDrawerBalance.toFixed(2)} ج.م</h3>
            <p className="text-[10px] text-gray-400">رصيد البداية المعتمد: 5000 ج.م</p>
          </div>
        </div>

      </div>

      {/* Secondary KPI widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="accounting-secondary-kpi">
        
        {/* VAT collected */}
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-500 font-extrabold text-xs border border-slate-100">
            ٪
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold">ضريبة القيمة المضافة المحصلة (VAT 14%)</p>
            <h4 className="text-base font-extrabold text-slate-700">{totalVATCollected.toFixed(2)} ج.م</h4>
            <p className="text-[9px] text-gray-400">مستحقة لمصلحة الضرائب المصرية</p>
          </div>
        </div>

        {/* Purchases total spending */}
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white shadow-xs flex items-center justify-center text-red-500 font-bold text-xs border border-slate-100">
            وارد
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold">مصروفات فواتير المشتريات (تأدية التوريد)</p>
            <h4 className="text-base font-extrabold text-red-600">-{totalPurchasesExpense.toFixed(2)} ج.م</h4>
            <p className="text-[9px] text-gray-400">إجمالي المدفوعات لمندوبي الشركات</p>
          </div>
        </div>

        {/* Current inventory asset valuation */}
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white shadow-xs flex items-center justify-center text-brand-green font-bold text-xs border border-slate-100">
            أصول
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold">قيمة البضاعة المخزنة الحالية (بالتكلفة)</p>
            <h4 className="text-base font-extrabold text-brand-green">{inventoryAssetValuationCost.toFixed(2)} ج.م</h4>
            <p className="text-[9px] text-gray-400">قيمة رأس المال العيني النشط على الأرفف</p>
          </div>
        </div>

      </div>

      {/* 3. Transaction Logs & Invoice Reprints (Supermarket accounting audit log) */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 space-y-4" id="accounting-sales-log">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-2 border-b border-slate-50">
          <div>
            <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <span>📃 دفتر يومية المبيعات وحساب الصندوق</span>
            </h3>
            <p className="text-[11px] text-gray-400">سجل متكامل يشمل عمليات البيع السريع وعمليات البيع بالفاتورة</p>
          </div>
          <span className="text-xs text-gray-500">إجمالي العمليات المسجلة: {transactions.length} عملية</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500">
                <th className="p-3">رقم العملية/الفاتورة</th>
                <th className="p-3">نوع العملية</th>
                <th className="p-3">التاريخ والوقت</th>
                <th className="p-3">العميل</th>
                <th className="p-3 text-center">طريقة الدفع</th>
                <th className="p-3 text-center">إجمالي المنتجات</th>
                <th className="p-3 text-center">الضريبة</th>
                <th className="p-3 text-center">الخصم</th>
                <th className="p-3 text-center">المبلغ الصافي</th>
                <th className="p-3 text-center">طباعة وإعادة إصدار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400 font-medium">
                    لا توجد عمليات مبيعات مسجلة اليوم حتى الآن. ابدأ بالبيع من لوحة نقطة البيع (POS).
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/40 transition-colors">
                    
                    {/* Invoice Number */}
                    <td className="p-3 font-mono font-bold text-slate-700">{tx.invoiceNumber}</td>
                    
                    {/* Type with badge */}
                    <td className="p-3">
                      {tx.type === 'quick' ? (
                        <span className="bg-brand-gold/15 text-amber-700 font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5 w-fit">
                          ⚡ بيع سريع فوري
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-brand-green font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5 w-fit">
                          📄 فاتورة ضريبية مبسطة
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-3 text-gray-400 font-medium">
                      {new Date(tx.timestamp).toLocaleString('ar-EG', { hour12: true })}
                    </td>

                    {/* Customer */}
                    <td className="p-3 text-slate-700 font-bold">
                      {tx.customerName || <span className="text-gray-400">عميل كاشير نقدي</span>}
                    </td>

                    {/* Payment Method */}
                    <td className="p-3 text-center font-bold">
                      {tx.paymentMethod === 'cash' ? (
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">كاش</span>
                      ) : (
                        <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded">فيزا / كارت</span>
                      )}
                    </td>

                    {/* Items Subtotal count */}
                    <td className="p-3 text-center text-gray-500 font-bold">
                      {tx.items.reduce((sum, item) => sum + item.quantity, 0)} وحدات
                    </td>

                    {/* VAT */}
                    <td className="p-3 text-center text-slate-500">
                      {tx.vat > 0 ? `${tx.vat.toFixed(2)} ج.م` : '0.00'}
                    </td>

                    {/* Discount */}
                    <td className="p-3 text-center text-red-500 font-bold">
                      {tx.discount > 0 ? `-${tx.discount.toFixed(2)} ج.م` : '0.00'}
                    </td>

                    {/* Final paid Net Total */}
                    <td className="p-3 text-center font-black text-brand-green">
                      {tx.total.toFixed(2)} ج.م
                    </td>

                    {/* Reprint Button */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => reprintInvoice(tx)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded flex items-center gap-1 mx-auto transition-colors font-bold"
                        title="إعادة عرض الفاتورة والطباعة"
                        id={`btn-reprint-invoice-${tx.id}`}
                      >
                        <Printer size={12} />
                        <span>طباعة</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
