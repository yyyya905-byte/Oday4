import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UtensilsCrossed, Printer, CheckCircle, X, Clock, Users, Flame, Coffee } from 'lucide-react';
import { soundEffects } from '../../services/audio';

interface KitchenTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KitchenTicketModal: React.FC<KitchenTicketModalProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    restaurantDiningType,
    selectedTable,
    guestCount,
    currentUser,
    language,
    t,
    notify,
  } = useApp();

  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    soundEffects.playBeep();
    notify(
      language === 'ar' ? 'تم إرسال بون المطبخ (KOT)' : 'Kitchen Ticket Sent',
      language === 'ar' ? `طاولة: ${selectedTable} • عدد الأصناف: ${cart.length}` : `Table: ${selectedTable}`,
      'success'
    );
    window.print();
    onClose();
  };

  const diningLabel = {
    dine_in: language === 'ar' ? 'صالة داخلية' : 'Dine-In',
    takeaway: language === 'ar' ? 'طلب سفري' : 'Takeaway',
    delivery: language === 'ar' ? 'طلب توصيل' : 'Delivery',
  }[restaurantDiningType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            <div>
              <h3 className="text-sm font-bold">{t('kitchenTicket')} (KOT)</h3>
              <p className="text-[11px] text-emerald-100">{diningLabel} • {selectedTable}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-700/60 hover:bg-emerald-700 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Ticket Receipt Preview */}
        <div className="p-5 overflow-y-auto max-h-[60vh] bg-slate-50 dark:bg-slate-950">
          <div
            ref={printRef}
            className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-5 rounded-2xl font-mono text-xs text-slate-800 dark:text-slate-200 shadow-xs"
          >
            <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-md font-black text-sm tracking-wider">
                بون تحضير المطبخ (KOT)
              </span>
              <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {diningLabel.toUpperCase()}
              </div>
            </div>

            <div className="py-2.5 border-b border-dashed border-slate-300 dark:border-slate-700 text-[11px] space-y-1">
              {restaurantDiningType === 'dine_in' && (
                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                  <span>الطاولة / القسم:</span>
                  <span className="bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded">
                    {selectedTable}
                  </span>
                </div>
              )}
              {restaurantDiningType === 'dine_in' && (
                <div className="flex justify-between">
                  <span>عدد الضيوف:</span>
                  <span>{guestCount} أشخاص</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>الكابتن / الكاشير:</span>
                <span>{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span>وقت الطلب:</span>
                <span>{new Date().toLocaleTimeString(language === 'ar' ? 'ar-SY' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Kitchen Items List */}
            <div className="py-3 space-y-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                قائمة الأصناف المطلوبة
              </div>
              {cart.map((item, idx) => (
                <div key={item.productId} className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center font-black text-xs">
                        {item.quantity}x
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                      </span>
                    </div>
                  </div>
                  {item.kitchenNotes && (
                    <div className="mt-1 ms-8 text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-900">
                      ⚡ ملاحظة: {item.kitchenNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400">
              --- نهاية أمر التحضير KOT ---
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'ar' ? 'طباعة وإرسال للشيف' : 'Print & Dispatch KOT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
