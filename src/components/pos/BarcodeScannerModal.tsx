import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScanBarcode, Camera, Search, PlusCircle, X, AlertCircle } from 'lucide-react';
import { soundEffects } from '../../services/audio';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductNotFound?: (scannedBarcode: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onProductNotFound
}) => {
  const { products, addToCart, t, formatCurrency, notify } = useApp();
  const [manualCode, setManualCode] = useState('');
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScanCode = (code: string) => {
    const clean = code.trim();
    if (!clean) return;

    const found = products.find(p => p.barcode === clean || p.sku.toLowerCase() === clean.toLowerCase());
    if (found) {
      soundEffects.playBeep();
      addToCart(found);
      notify('تمت إضافة المنتج للسلة', `${found.nameAr} (${formatCurrency(found.price)})`, 'success');
      setManualCode('');
      setNotFoundCode(null);
      onClose();
    } else {
      soundEffects.playWarning();
      setNotFoundCode(clean);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScanCode(manualCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('scanBarcode')} / قارئ الباركود
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          {/* Visual Scanner Guide Viewfinder */}
          <div className="relative w-full h-44 bg-slate-900 rounded-2xl flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-amber-500/50">
            {/* Animated Laser line */}
            <div className="absolute inset-x-4 h-0.5 bg-red-500 shadow-lg shadow-red-500 animate-bounce" />

            <ScanBarcode className="w-16 h-16 text-slate-700 animate-pulse" />
            <span className="text-xs text-slate-400 mt-2">
              وجّه قارئ الباركود اليدوي أو أدخل الكود أدناه
            </span>
          </div>

          {/* Manual Input Fallback & Scanner Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                autoFocus
                value={manualCode}
                onChange={e => {
                  setManualCode(e.target.value);
                  setNotFoundCode(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="أدخل الباركود أو SKU..."
                className="w-full pl-3 pr-9 py-2.5 bg-slate-100 dark:bg-slate-800 text-sm font-mono font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500"
              />
              <ScanBarcode className="w-4 h-4 text-slate-400 absolute start-3 top-3.5" />
            </div>

            <button
              onClick={() => handleScanCode(manualCode)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0"
            >
              بحث
            </button>
          </div>

          {/* Quick Demo Barcodes for instant testing */}
          <div className="text-start">
            <p className="text-[11px] font-bold text-slate-400 mb-1.5">باركود تجريبي سريع:</p>
            <div className="flex flex-wrap gap-1.5">
              {products.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleScanCode(p.barcode)}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {p.barcode} ({p.nameAr})
                </button>
              ))}
            </div>
          </div>

          {/* Not Found Warning & Action */}
          {notFoundCode && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-start animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    الباركود ({notFoundCode}) غير موجود!
                  </p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                    {t('wantToAddProduct')}
                  </p>
                  {onProductNotFound && (
                    <button
                      onClick={() => {
                        onClose();
                        onProductNotFound(notFoundCode);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{t('addProduct')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
