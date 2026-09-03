import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import QRCode from 'qrcode';
import { Printer, Download, CheckCircle, X, Sparkles } from 'lucide-react';

interface PrintableReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  isOpen,
  onClose,
  sale
}) => {
  const { settings, formatCurrency, t, language } = useApp();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (sale) {
      // Standard POS QR Data containing store, invoice #, timestamp, total, and tax
      const qrPayload = JSON.stringify({
        store: settings.storeNameAr,
        inv: sale.invoiceNumber,
        date: sale.createdAt,
        total: sale.total,
        tax: sale.taxTotal,
        cashier: sale.cashierName,
      });

      QRCode.toDataURL(qrPayload, { width: 140, margin: 1 })
        .then(url => setQrCodeDataUrl(url))
        .catch(() => {});
    }
  }, [sale, settings]);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Modal Top Actions (no-print) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('saleCompletedSuccessfully')}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <div
            id="printable-receipt"
            className="bg-white text-black p-6 rounded-2xl border border-slate-200 font-sans shadow-xs text-center"
            style={{ maxWidth: '340px', margin: '0 auto', fontSize: '12px' }}
          >
            {/* Receipt Store Branding */}
            <div className="border-b border-dashed border-slate-300 pb-3 mb-3">
              <h2 className="text-lg font-black tracking-tight">{settings.storeNameAr}</h2>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{settings.storeNameEn}</p>
              <p className="text-[11px] text-slate-700 mt-1">{settings.address}</p>
              <p className="text-[10px] text-slate-600 font-mono">هاتف: {settings.phone}</p>
              {settings.taxNumber && (
                <p className="text-[10px] text-slate-600 font-mono">الرقم الضريبي: {settings.taxNumber}</p>
              )}
            </div>

            {/* Invoice Meta */}
            <div className="text-[11px] text-slate-700 text-start space-y-0.5 border-b border-dashed border-slate-300 pb-2 mb-2">
              <div className="flex justify-between">
                <span>رقم الفاتورة:</span>
                <span className="font-mono font-bold">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>التاريخ والوقت:</span>
                <span className="font-mono">{new Date(sale.createdAt).toLocaleString(language === 'ar' ? 'ar-SY' : 'en-US')}</span>
              </div>
              <div className="flex justify-between">
                <span>الكاشير:</span>
                <span className="font-semibold">{sale.cashierName}</span>
              </div>

              {/* Restaurant Meta if present */}
              {sale.businessMode === 'restaurant' && (
                <div className="flex justify-between font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <span>نوع الطلب:</span>
                  <span>
                    {sale.diningType === 'dine_in' ? `صالة (${sale.tableName || 'طاولة'} - ${sale.guestCount || 1} ضيوف)` : sale.diningType === 'takeaway' ? 'سفري / معلب' : 'توصيل دليفري'}
                  </span>
                </div>
              )}

              {/* Wholesale Meta if present */}
              {sale.tradeType === 'wholesale' && (
                <div className="flex justify-between font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                  <span>نوع المعاملة:</span>
                  <span>فاتورة جملة / موزع</span>
                </div>
              )}

              {sale.customerName && (
                <div className="flex justify-between">
                  <span>العميل:</span>
                  <span className="font-bold">{sale.customerName} ({sale.customerCode})</span>
                </div>
              )}
            </div>

            {/* Receipt Items Table */}
            <table className="w-full text-[11px] my-2 text-start">
              <thead>
                <tr className="border-b border-black text-black">
                  <th className="py-1 text-start">الصنف</th>
                  <th className="py-1 text-center">الكمية</th>
                  <th className="py-1 text-end">السعر</th>
                  <th className="py-1 text-end">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {sale.items.map((it, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1 font-medium">
                      <div>{it.productNameAr}</div>
                      {it.wholesaleUnit && (
                        <div className="text-[9px] text-amber-700 font-bold">({it.wholesaleUnit})</div>
                      )}
                      {it.kitchenNotes && (
                        <div className="text-[9px] text-slate-500 italic font-mono">ملاحظة: {it.kitchenNotes}</div>
                      )}
                    </td>
                    <td className="py-1 text-center font-mono">{it.quantity}</td>
                    <td className="py-1 text-end font-mono">{it.unitPrice.toLocaleString()}</td>
                    <td className="py-1 text-end font-bold font-mono">{it.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations & Totals */}
            <div className="border-t border-dashed border-black pt-2 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-700">
                <span>المجموع الفرعي:</span>
                <span className="font-mono">{sale.subtotal.toLocaleString()} {settings.currency.symbol}</span>
              </div>

              {sale.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>الخصم الممنوح:</span>
                  <span className="font-mono">-{sale.discountTotal.toLocaleString()} {settings.currency.symbol}</span>
                </div>
              )}

              {sale.taxTotal > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>الضريبة:</span>
                  <span className="font-mono">+{sale.taxTotal.toLocaleString()} {settings.currency.symbol}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black border-t-2 border-b-2 border-black py-1.5 my-1.5">
                <span>الإجمالي النهائي:</span>
                <span className="font-mono">{sale.total.toLocaleString()} {settings.currency.symbol}</span>
              </div>

              <div className="flex justify-between text-slate-800">
                <span>طريقة الدفع:</span>
                <span className="font-bold">
                  {sale.paymentMethod === 'cash' || sale.paymentMethod === 'نقداً'
                    ? 'نقداً (Cash)'
                    : sale.paymentMethod === 'card'
                    ? 'بطاقة بنكية (Card)'
                    : sale.paymentMethod === 'transfer'
                    ? 'تحويل إلكتروني (Transfer)'
                    : sale.paymentMethod === 'credit' || sale.paymentMethod === 'آجل'
                    ? 'آجل على الحساب (Credit/Debt)'
                    : sale.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between text-slate-800">
                <span>المبلغ المدفوع / المستلم:</span>
                <span className="font-mono font-bold">{sale.paidAmount.toLocaleString()} {settings.currency.symbol}</span>
              </div>

              {sale.changeAmount > 0 ? (
                <div className="flex justify-between font-black text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">
                  <span>المبلغ الباقي للزبون (الفكة):</span>
                  <span className="font-mono">{sale.changeAmount.toLocaleString()} {settings.currency.symbol}</span>
                </div>
              ) : (sale.paymentMethod === 'credit' || sale.paymentMethod === 'آجل') && (sale.total - sale.paidAmount) > 0 ? (
                <div className="flex justify-between font-black text-indigo-900 bg-indigo-50 px-1 py-0.5 rounded">
                  <span>المتبقي كدين آجل على الحساب:</span>
                  <span className="font-mono">{(sale.total - sale.paidAmount).toLocaleString()} {settings.currency.symbol}</span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-600">
                  <span>الباقي:</span>
                  <span className="font-mono">0 {settings.currency.symbol}</span>
                </div>
              )}
            </div>

            {/* Customer Points Section */}
            {sale.customerName && (
              <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px]">
                <div className="flex justify-between font-bold text-amber-700">
                  <span>النقاط المكتسبة من هذه الفاتورة:</span>
                  <span>+{sale.pointsEarned} نقطة</span>
                </div>
                {sale.pointsRedeemed > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span>النقاط المستبدلة:</span>
                    <span>-{sale.pointsRedeemed} نقطة</span>
                  </div>
                )}
              </div>
            )}

            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="my-3 flex flex-col items-center justify-center">
                <img src={qrCodeDataUrl} alt="Receipt QR" className="w-24 h-24" />
                <span className="text-[9px] text-slate-400 font-mono mt-0.5">مسح للتحقق من الفاتورة</span>
              </div>
            )}

            {/* Footer Message */}
            <div className="border-t border-dashed border-slate-300 pt-2 text-[10px] text-slate-500">
              <p>{settings.receiptFooter}</p>
              <p className="font-bold mt-1 text-[9px]">KIAN CASHIER POS • o-xtr8</p>
            </div>
          </div>

          {/* New Sale Button */}
          <button
            onClick={onClose}
            className="w-full mt-4 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-all no-print"
          >
            {t('newSale')} (بدء فاتورة جديدة)
          </button>
        </div>
      </div>
    </div>
  );
};
