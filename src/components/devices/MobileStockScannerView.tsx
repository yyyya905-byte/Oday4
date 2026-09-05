import React, { useState, useEffect, useRef } from 'react';
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
  AlertTriangle,
  Zap,
  ShoppingCart,
  Send,
  Video,
  RefreshCw
} from 'lucide-react';
import { soundEffects } from '../../services/audio';
import { Html5Qrcode } from 'html5-qrcode';

export const MobileStockScannerView: React.FC<{ onBackToMain?: () => void }> = ({ onBackToMain }) => {
  const { 
    products, 
    adjustStock, 
    formatCurrency, 
    notify,
    language,
    sendRemoteBarcodeScan
  } = useApp();

  const [scanMode, setScanMode] = useState<'pos_relay' | 'stock_audit'>('pos_relay');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [isScanningSim, setIsScanningSim] = useState(false);
  const [recentScans, setRecentScans] = useState<{ product?: Product; code: string; mode: string; time: string }[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScanTimestamp = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>('');

  const processBarcodeScan = async (code: string) => {
    const clean = code.trim();
    if (!clean) return;

    // Prevent duplicate triggers within 1.3 seconds
    const now = Date.now();
    if (clean === lastScannedCodeRef.current && now - lastScanTimestamp.current < 1300) {
      return;
    }
    lastScanTimestamp.current = now;
    lastScannedCodeRef.current = clean;

    const found = products.find(p =>
      p.barcode.toLowerCase() === clean.toLowerCase() ||
      p.sku.toLowerCase() === clean.toLowerCase() ||
      p.identificationCodes?.some(c => c.toLowerCase() === clean.toLowerCase())
    );

    if (found) {
      setSelectedProduct(found);
      soundEffects.playBeep();

      if (scanMode === 'pos_relay') {
        // Instant Relay to Master POS Cart!
        await sendRemoteBarcodeScan(clean, 1, 'ماسح باركود متنقل');
        notify(
          '⚡ تم الإرسال لكاشير البيع فوراً',
          `تم إرسال [${language === 'ar' ? found.nameAr : found.nameEn}] وإضافته لسلة الكاشير المركزي`,
          'success'
        );
      } else {
        notify('تم مسح المنتج', `${language === 'ar' ? found.nameAr : found.nameEn} (الرصيد: ${found.stock})`, 'info');
      }

      setRecentScans(prev => [
        {
          product: found,
          code: clean,
          mode: scanMode === 'pos_relay' ? 'إرسال لكاشير البيع' : 'جرد وتعديل رصيد',
          time: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
        ...prev.slice(0, 9)
      ]);
    } else {
      soundEffects.playWarning();
      notify('المنتج غير مسجل', `لم يتم العثور على باركود أو كود تعريفي: ${clean}`, 'warning');
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (html5QrCodeRef.current) {
        try { await html5QrCodeRef.current.stop(); } catch {}
      }

      const scanner = new Html5Qrcode("mobile-stock-video-reader");
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 240, height: 140 },
          aspectRatio: 1.4,
        },
        (decodedText) => {
          processBarcodeScan(decodedText);
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Mobile camera error:", err);
      setCameraError(language === 'ar' ? 'تعذر تشغيل الكاميرا' : 'Camera start failed');
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn("Error stopping camera:", e);
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    processBarcodeScan(barcodeInput.trim());
    setBarcodeInput('');
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
      {
        product: selectedProduct,
        code: selectedProduct.barcode,
        mode: `تعديل مخزون (${delta > 0 ? '+' : ''}${delta})`,
        time: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      },
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
              onClick={() => {
                stopCamera();
                onBackToMain();
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
            <ScanBarcode className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {language === 'ar' ? 'قارئ الباركود والجرد المتنقل' : 'Mobile POS Scanner'}
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {scanMode === 'pos_relay' 
                ? (language === 'ar' ? '⚡ وضع الإرسال المباشر لكاشير البيع' : '⚡ Direct Master POS Relay')
                : (language === 'ar' ? 'وضع جرد وتعديل الرفوف' : 'Stock Audit Mode')
              }
            </p>
          </div>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setScanMode('pos_relay')}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
              scanMode === 'pos_relay'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إرسال للكاشير' : 'To POS'}</span>
          </button>
          <button
            onClick={() => setScanMode('stock_audit')}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
              scanMode === 'stock_audit'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'جرد' : 'Audit'}</span>
          </button>
        </div>
      </div>

      {/* Barcode Camera Feed Viewfinder */}
      <div className="p-3 bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden shrink-0">
        <div className="w-full max-w-sm h-36 border-2 border-dashed border-amber-500/80 rounded-2xl relative flex items-center justify-center bg-slate-950 overflow-hidden shadow-inner">
          <div id="mobile-stock-video-reader" className="w-full h-full overflow-hidden rounded-xl" />

          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-slate-900 text-slate-300">
              <Camera className="w-8 h-8 text-amber-500/50 mb-1" />
              <p className="text-[11px] font-semibold mb-1">
                {cameraError || (language === 'ar' ? 'الكاميرا متوقفة' : 'Camera off')}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{language === 'ar' ? 'تشغيل الكاميرا' : 'Start Camera'}</span>
              </button>
            </div>
          )}

          {isCameraActive && (
            <div className="absolute top-2 start-2 z-10 flex items-center gap-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-full">
                {language === 'ar' ? 'المسح نشط' : 'Active'}
              </span>
            </div>
          )}
        </div>

        {/* Barcode Quick Test Buttons */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
          <span className="text-[10px] text-slate-400 whitespace-nowrap">
            {language === 'ar' ? 'مسح تجريبي:' : 'Demo scan:'}
          </span>
          {products.slice(0, 4).map(p => (
            <button
              key={p.id}
              onClick={() => processBarcodeScan(p.barcode)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-amber-500/20 active:scale-95 text-slate-200 text-[10px] rounded-lg border border-slate-700 whitespace-nowrap"
            >
              {p.barcode}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleBarcodeSubmit} className="p-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="relative">
          <ScanBarcode className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={barcodeInput}
            onChange={e => setBarcodeInput(e.target.value)}
            placeholder={language === 'ar' ? 'أدخل الباركود أو الكود التعريفي يدوياً...' : 'Enter barcode or identification code...'}
            className="w-full ps-9 pe-16 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="absolute end-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold"
          >
            {language === 'ar' ? 'مسح' : 'Scan'}
          </button>
        </div>
      </form>

      {/* Active Scanned Product Box */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {selectedProduct ? (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
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
                {selectedProduct.identificationCodes && selectedProduct.identificationCodes.length > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    {selectedProduct.identificationCodes.length} أكواد تعريفية مرتبطة
                  </p>
                )}
              </div>

              {/* Stock Badge */}
              <div className="text-end bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'الرصيد' : 'Stock'}</span>
                <span className={`text-xl font-black ${selectedProduct.stock <= selectedProduct.minStock ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {selectedProduct.stock}
                </span>
              </div>
            </div>

            {/* Quick Relay Button to POS */}
            <button
              onClick={() => {
                sendRemoteBarcodeScan(selectedProduct.barcode, 1, 'ماسح باركود متنقل');
                notify('تم إرسال الصنف لكاشير البيع', `${selectedProduct.nameAr} (+1)`, 'success');
                soundEffects.playBeep();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-white text-xs font-black shadow-xs flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إرسال فوراً إلى سلة كاشير البيع (+1)' : 'Send to Master POS (+1)'}</span>
            </button>

            {/* Stock Adjust Steppers if in Stock Audit Mode */}
            {scanMode === 'stock_audit' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                  {language === 'ar' ? 'تعديل رصيد المخزون فورياً:' : 'Instant Stock Adjust:'}
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
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            {language === 'ar' ? 'امسح باركود أي منتج للبدء' : 'Scan any barcode to start'}
          </div>
        )}

        {/* Scan Log History */}
        {recentScans.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'ar' ? 'سجل العمليات السريعة' : 'Recent Scan Log'}</span>
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentScans.map((s, i) => (
                <div key={i} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {s.product ? (language === 'ar' ? s.product.nameAr : s.product.nameEn) : s.code}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{s.mode} • {s.time}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    ناجح
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
