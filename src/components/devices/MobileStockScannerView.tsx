import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  ScanBarcode,
  Search,
  Plus,
  Minus,
  CheckCircle2,
  Package,
  ArrowRight,
  Sparkles,
  Camera,
  History,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { soundEffects } from '../../services/audio';

export const MobileStockScannerView: React.FC<{ onBackToMain?: () => void }> = ({ onBackToMain }) => {
  const { 
    products, 
    adjustStock, 
    formatCurrency, 
    notify,
    language 
  } = useApp();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [isScanningSim, setIsScanningSim] = useState(false);
  const [recentScans, setRecentScans] = useState<{ product: Product; delta: number; time: string }[]>([]);

  const handleScanSimulate = (prod: Product) => {
    setIsScanningSim(true);
    soundEffects.beep();
    setTimeout(() => {
      setSelectedProduct(prod);
      setIsScanningSim(false);
    }, 400);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = products.find(p => p.barcode === barcodeInput.trim() || p.sku.toLowerCase() === barcodeInput.trim().toLowerCase());
    if (found) {
      setSelectedProduct(found);
      soundEffects.beep();
      setBarcodeInput('');
    } else {
      notify('المنتج غير موجود', `لم يتم العثور على باركود ${barcodeInput}`, 'warning');
    }
  };

  const handleAdjust = (delta: number) => {
    if (!selectedProduct) return;
    const type = delta > 0 ? 'restock' : 'adjustment';
    const reason = `تعديل عبر ماسح الجرد المتنقل (${delta > 0 ? '+' : ''}${delta})`;
    
    adjustStock(selectedProduct.id, delta, type, reason);
    soundEffects.saleSuccess();

    // Update local selected state
    setSelectedProduct(prev => prev ? { ...prev, stock: prev.stock + delta } : null);

    // Add to history
    setRecentScans(prev => [
      { product: selectedProduct, delta, time: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
      ...prev.slice(0, 9)
    ]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans select-none">
      {/* Mobile Top Header */}
      <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3.5 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold">
            <ScanBarcode className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {language === 'ar' ? 'ماسح الجرد والباركود المتنقل' : 'Stock Scanner'}
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'تحديث المخزون والرفوف فورياً' : 'Live Inventory Auditing'}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
          مستودع 1
        </span>
      </div>

      {/* Barcode Camera Frame */}
      <div className="p-4 bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden shrink-0">
        <div className="w-full max-w-xs h-36 border-2 border-dashed border-amber-500/80 rounded-2xl relative flex items-center justify-center bg-slate-950/60 overflow-hidden">
          {/* Animated Scanning Laser */}
          <div className="absolute inset-x-0 h-0.5 bg-amber-400 shadow-md shadow-amber-500 animate-bounce" />
          <Camera className="w-8 h-8 text-amber-500/40" />
          <span className="absolute bottom-2 text-[10px] text-slate-400 font-mono">
            {language === 'ar' ? 'وجه الكاميرا نحو الباركود' : 'Align Barcode in frame'}
          </span>
        </div>

        {/* Barcode Quick Sim Buttons */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          <span className="text-[10px] text-slate-400 whitespace-nowrap">تجربة مسح:</span>
          {products.slice(0, 4).map(p => (
            <button
              key={p.id}
              onClick={() => handleScanSimulate(p)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-[10px] rounded-lg border border-slate-700 whitespace-nowrap"
            >
              {p.barcode}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Search or Scan Input */}
      <form onSubmit={handleBarcodeSubmit} className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="relative">
          <ScanBarcode className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={barcodeInput}
            onChange={e => setBarcodeInput(e.target.value)}
            placeholder={language === 'ar' ? 'أدخل رقم الباركود يدوياً أو امسحه...' : 'Enter barcode manually...'}
            className="w-full ps-9 pe-16 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="absolute end-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold"
          >
            {language === 'ar' ? 'فحص' : 'Scan'}
          </button>
        </div>
      </form>

      {/* Active Scanned Product Box */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {selectedProduct ? (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {selectedProduct.barcode}
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  {language === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                  {formatCurrency(selectedProduct.price)} • {selectedProduct.unit}
                </p>
              </div>

              {/* Stock Badge */}
              <div className="text-end bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'الرصيد الحالي' : 'Current Stock'}</span>
                <span className={`text-xl font-black ${selectedProduct.stock <= selectedProduct.minStock ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {selectedProduct.stock}
                </span>
              </div>
            </div>

            {/* Quick Adjustment Steppers */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                {language === 'ar' ? 'تعديل الرصيد فورياً:' : 'Instant Stock Adjust:'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleAdjust(1)}
                  className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> 1
                </button>
                <button
                  onClick={() => handleAdjust(5)}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> 5
                </button>
                <button
                  onClick={() => handleAdjust(-1)}
                  className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5" /> 1
                </button>
                <button
                  onClick={() => handleAdjust(-5)}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5" /> 5
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            {language === 'ar' ? 'امسح باركود أي منتج لعرض وتعديل المخزون' : 'Scan a product barcode to adjust stock'}
          </div>
        )}

        {/* Scan Log History */}
        {recentScans.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'ar' ? 'سجل العمليات الأخيرة' : 'Recent Scan Log'}</span>
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentScans.map((s, i) => (
                <div key={i} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {language === 'ar' ? s.product.nameAr : s.product.nameEn}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{s.time}</span>
                  </div>
                  <span className={`font-black ${s.delta > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {s.delta > 0 ? `+${s.delta}` : s.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
