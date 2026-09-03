import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale, SaleItem } from '../../types';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Package,
  Calendar,
  DollarSign,
  User,
  History
} from 'lucide-react';

export const ReturnsView: React.FC = () => {
  const {
    sales,
    returns,
    processReturn,
    formatCurrency,
    t,
    language,
    settings,
    notify
  } = useApp();

  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Sale | null>(null);
  const [returnItems, setReturnItems] = useState<{ [productId: string]: number }>({});
  const [reason, setReason] = useState('رغبة العميل');
  const [restock, setRestock] = useState(true);

  const handleSearchInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = invoiceQuery.trim().toLowerCase();
    if (!clean) return;

    const found = sales.find(s => s.invoiceNumber.toLowerCase() === clean);
    if (found) {
      setSelectedInvoice(found);
      // Initialize return quantities
      const initial: { [productId: string]: number } = {};
      found.items.forEach(it => {
        initial[it.productId] = 0;
      });
      setReturnItems(initial);
    } else {
      notify('غير موجود', `لم يتم العثور على فاتورة برقم ${invoiceQuery}`, 'warning');
      setSelectedInvoice(null);
    }
  };

  const handleQuantityChange = (productId: string, val: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, val));
    setReturnItems(prev => ({
      ...prev,
      [productId]: clamped,
    }));
  };

  // Calculate return refund total
  const calculateRefundTotal = () => {
    if (!selectedInvoice) return 0;
    let sum = 0;
    selectedInvoice.items.forEach(it => {
      const qty = returnItems[it.productId] || 0;
      if (qty > 0) {
        sum += it.unitPrice * qty;
      }
    });
    return sum;
  };

  const handleConfirmReturn = () => {
    if (!selectedInvoice) return;

    const itemsToReturn: SaleItem[] = [];
    selectedInvoice.items.forEach(it => {
      const qty = returnItems[it.productId] || 0;
      if (qty > 0) {
        itemsToReturn.push({
          ...it,
          quantity: qty,
          total: it.unitPrice * qty,
        });
      }
    });

    if (itemsToReturn.length === 0) {
      notify('تنبيه', 'يرجى تحديد كمية صنف واحد على الأقل للإرجاع', 'warning');
      return;
    }

    const ret = processReturn({
      originalSaleId: selectedInvoice.id,
      items: itemsToReturn,
      reason,
      restockItems: restock,
    });

    if (ret) {
      notify('تم بنجاح', `تم تسجيل عملية المرتجع واسترداد ${formatCurrency(ret.totalRefund)}`, 'success');
      setSelectedInvoice(null);
      setInvoiceQuery('');
    }
  };

  const refundTotal = calculateRefundTotal();

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('returnsTitle')}</span>
            <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
              إدارة المرتجعات والاسترداد
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            معالجة مرتجعات المبيعات، إعادة الأصناف للمخزون، واسترداد المبالغ للعميل
          </p>
        </div>
      </div>

      {/* Invoice Search Box */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          البحث عن الفاتورة الأصلية لإجراء المرتجع
        </h3>

        <form onSubmit={handleSearchInvoice} className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <input
              type="text"
              value={invoiceQuery}
              onChange={e => setInvoiceQuery(e.target.value)}
              placeholder="أدخل رقم الفاتورة (مثال: INV-20260831-0001)..."
              className="w-full pl-3 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3.5" />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0"
          >
            بحث عن الفاتورة
          </button>
        </form>

        {/* Quick Demo Invoices */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 block mb-1">فواتير مسجلة جاهزة للتجربة:</span>
          <div className="flex flex-wrap gap-1.5">
            {(sales || []).slice(0, 4).map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setInvoiceQuery(s.invoiceNumber);
                  setSelectedInvoice(s);
                  const initial: { [productId: string]: number } = {};
                  (s.items || []).forEach(it => {
                    initial[it.productId] = 0;
                  });
                  setReturnItems(initial);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {s.invoiceNumber} ({formatCurrency(s.total)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Invoice Return Form */}
      {selectedInvoice && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <span className="text-xs text-slate-400 block">الفاتورة المحددة:</span>
              <h3 className="text-base font-black text-slate-900 dark:text-white font-mono">
                {selectedInvoice.invoiceNumber}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                العميل: {selectedInvoice.customerName || 'عميل نقدي'} • التاريخ: {new Date(selectedInvoice.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="text-end">
              <span className="text-xs text-slate-400 block">إجمالي الفاتورة الأصلية:</span>
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(selectedInvoice.total)}
              </span>
            </div>
          </div>

          {/* Items Return Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-2 text-start">الصنف</th>
                  <th className="pb-2 text-center">الكمية المباعة</th>
                  <th className="pb-2 text-end">سعر الوحدة</th>
                  <th className="pb-2 text-center">الكمية المراد إرجاعها</th>
                  <th className="pb-2 text-end">مبلغ الاسترداد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedInvoice.items.map(item => {
                  const currentReturnQty = returnItems[item.productId] || 0;
                  const itemRefund = item.unitPrice * currentReturnQty;

                  return (
                    <tr key={item.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {item.productNameAr}
                      </td>
                      <td className="py-3 text-center font-mono font-bold">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-end font-mono text-slate-500">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, currentReturnQty - 1, item.quantity)}
                            className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-slate-900 dark:text-white">
                            {currentReturnQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, currentReturnQty + 1, item.quantity)}
                            className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 text-end font-mono font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(itemRefund)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Reason and Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                سبب الإرجاع:
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="رغبة العميل">رغبة العميل (تغيير رأي)</option>
                <option value="منتج به عيب تصنيع">منتج به عيب تصنيع أو تلف</option>
                <option value="صنف غير مطابق للطلب">صنف غير مطابق للطلب</option>
                <option value="أخرى">سبب آخر</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="restock-checkbox"
                checked={restock}
                onChange={e => setRestock(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <label htmlFor="restock-checkbox" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                إعادة الأصناف المرتجعة إلى المخزون تلقائياً (+ زيادة الكمية)
              </label>
            </div>
          </div>

          {/* Submit Return */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 block">المبلغ الإجمالي المسترد للعميل:</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {formatCurrency(refundTotal)}
              </span>
            </div>

            <button
              type="button"
              disabled={refundTotal <= 0}
              onClick={handleConfirmReturn}
              className={`px-8 py-3.5 rounded-2xl text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all ${
                refundTotal <= 0
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>تأكيد الإرجاع واسترداد المبلغ</span>
            </button>
          </div>
        </div>
      )}

      {/* Returns History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-amber-500" />
          <span>سجل المرتجعات السابقة</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                <th className="pb-2 text-start">رقم المرتجع</th>
                <th className="pb-2 text-start">الفاتورة الأصلية</th>
                <th className="pb-2 text-start">السبب</th>
                <th className="pb-2 text-center">الأصناف المرتجعة</th>
                <th className="pb-2 text-end">مبلغ الاسترداد</th>
                <th className="pb-2 text-end">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(!returns || returns.length === 0) ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    لا توجد عمليات إرجاع مسجلة
                  </td>
                </tr>
              ) : (
                returns.map((ret: any) => (
                  <tr key={ret.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {ret.returnNumber || ret.refundNumber || `REF-${ret.id}`}
                    </td>
                    <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                      {ret.originalInvoiceNumber || ret.invoiceNumber || '—'}
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">
                      {ret.reason || 'إرجاع'}
                    </td>
                    <td className="py-3 text-center font-mono">
                      {(ret.items || []).reduce((acc: number, it: any) => acc + (it.quantity || 0), 0)} قطع
                    </td>
                    <td className="py-3 text-end font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(ret.totalRefund ?? ret.totalRefundAmount ?? 0)}
                    </td>
                    <td className="py-3 text-end text-slate-400 font-mono">
                      {ret.createdAt ? new Date(ret.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SY' : 'en-US') : '—'}
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
};
