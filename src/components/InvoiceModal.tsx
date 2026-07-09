import React from 'react';
import { Transaction } from '../types';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function InvoiceModal({ transaction, onClose }: InvoiceModalProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalQuantity = transaction.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col justify-between">
        
        {/* Top Control Bar (Non-printable) */}
        <div className="bg-brand-green text-white p-3.5 flex justify-between items-center print:hidden">
          <span className="font-extrabold text-xs flex items-center gap-1">
            <ShieldCheck size={14} className="text-brand-gold" />
            <span>فاتورة معتمدة رقم {transaction.invoiceNumber}</span>
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-brand-gold hover:bg-amber-500 text-brand-green font-bold text-xs px-2.5 py-1 rounded flex items-center gap-1 transition-colors"
              title="طباعة الفاتورة للجهاز"
              id="btn-modal-print"
            >
              <Printer size={12} />
              <span>طباعة</span>
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200"
              id="btn-modal-close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT AREA */}
        <div className="p-6 bg-white font-mono text-slate-800" id="printable-receipt">
          {/* Header */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-200">
            <div className="flex justify-center items-center gap-1 mb-1">
              <span className="text-lg font-black text-brand-green">تازه مارت</span>
              <span className="text-[10px] border border-brand-green px-1 rounded text-brand-green font-bold uppercase">Tazaj Mart</span>
            </div>
            <p className="text-[10px] text-gray-500 font-bold">فرع القاهرة الجديدة - بجوار الجامعة الأمريكية</p>
            <p className="text-[9px] text-gray-400">سجل تجاري: 290812 | الرقم الضريبي: 541-987-320</p>
            <p className="text-[9px] text-gray-400">هاتف الدعم والمبيعات: 19999</p>
          </div>

          {/* Invoice Metadata */}
          <div className="py-3 text-[10px] space-y-1 border-b border-dashed border-slate-200">
            <div className="flex justify-between">
              <span>رقم الفاتورة:</span>
              <span className="font-bold">{transaction.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>نوع الفاتورة:</span>
              <span className="font-bold">
                {transaction.type === 'quick' ? 'فاتورة بيع نقدي سريع كاش' : 'فاتورة ضريبية مبسطة (مستهلك)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>التاريخ والوقت:</span>
              <span className="font-bold">
                {new Date(transaction.timestamp).toLocaleString('ar-EG', { hour12: false })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>الكاشير المسؤول:</span>
              <span className="font-bold">أ/ أحمد محمود (كود 81)</span>
            </div>
            <div className="flex justify-between">
              <span>العميل:</span>
              <span className="font-bold">{transaction.customerName || 'عميل نقدي عادي'}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 text-[10px] border-b border-dashed border-slate-200">
            <div className="grid grid-cols-12 font-bold text-slate-600 pb-1.5 text-right">
              <span className="col-span-6">اسم الصنف</span>
              <span className="col-span-2 text-center">الكمية</span>
              <span className="col-span-2 text-center">السعر</span>
              <span className="col-span-2 text-left">الإجمالي</span>
            </div>
            
            <div className="divide-y divide-slate-100 space-y-1.5 pt-1">
              {transaction.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 py-1 items-center">
                  <div className="col-span-6">
                    <p className="font-bold text-slate-800 line-clamp-1">{item.nameAr}</p>
                  </div>
                  <span className="col-span-2 text-center">{item.quantity}</span>
                  <span className="col-span-2 text-center">{item.salePrice.toFixed(2)}</span>
                  <span className="col-span-2 text-left font-bold text-slate-900">
                    {(item.salePrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Taxes block */}
          <div className="py-3 text-[10px] space-y-1 border-b border-dashed border-slate-200">
            <div className="flex justify-between">
              <span>عدد المواد المباعة:</span>
              <span className="font-bold">{totalQuantity} قطعة</span>
            </div>
            <div className="flex justify-between">
              <span>إجمالي المنتجات قبل الضريبة والخصم:</span>
              <span>{(transaction.subtotal).toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span>ضريبة القيمة المضافة (14%):</span>
              <span>{transaction.vat.toFixed(2)} ج.م</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>خصم خاص نقدي كاشير:</span>
                <span>-{transaction.discount.toFixed(2)} ج.م</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm font-black text-brand-green pt-2">
              <span>صافي المدفوع النهائي:</span>
              <span>{transaction.total.toFixed(2)} ج.م</span>
            </div>
          </div>

          {/* Payment Method & footer info */}
          <div className="py-3 text-[10px] space-y-1 text-center">
            <div className="flex justify-center gap-1 mb-1 font-bold">
              <span>طريقة السداد:</span>
              <span className="bg-slate-100 px-1 rounded">
                {transaction.paymentMethod === 'cash' ? 'كاش ونقداً (صندوق الكاش)' : 'فيزا / بطاقة بنكية (شبكة)'}
              </span>
            </div>
            <p className="text-[9px] text-gray-400 mt-2">الأسعار تشمل ضريبة القيمة المضافة المقررة قانوناً</p>
            <p className="text-slate-700 font-extrabold pt-2">شكراً لزيارتكم لتازه مارت! 💚</p>
          </div>

          {/* Simulated Barcode */}
          <div className="pt-2 flex flex-col items-center justify-center">
            {/* Real aesthetic CSS barcode */}
            <div className="flex items-center gap-[1px] h-8 opacity-75">
              {[2,1,3,1,2,4,1,2,1,3,2,1,4,1,2,3,1,2,4,1,2,1].map((w, i) => (
                <div
                  key={i}
                  className="bg-black h-full"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
            <span className="text-[8px] text-gray-400 mt-1 font-mono">*{transaction.id.slice(-8)}*</span>
          </div>

        </div>

        {/* Modal bottom actions (Non-printable) */}
        <div className="bg-slate-50 p-3 flex justify-end gap-2 border-t border-slate-100 print:hidden">
          <button
            onClick={onClose}
            className="w-full bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-sm"
            id="btn-modal-done"
          >
            تأكيد وإغلاق الفاتورة للوردية
          </button>
        </div>

      </div>
    </div>
  );
}
