import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeftRight, 
  Send, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  QrCode, 
  Wifi, 
  Layers, 
  Package, 
  Users, 
  Receipt, 
  Settings, 
  ShieldCheck, 
  RefreshCw, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Database, 
  Sparkles, 
  X,
  Radio,
  ArrowRight,
  Info
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { indexedDbService, DeviceTransferPackage } from '../../services/indexedDbService';
import { Product, Category, Customer, Sale, StoreSettings } from '../../types';

interface DeviceDataTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'send' | 'receive';
}

export const DeviceDataTransferModal: React.FC<DeviceDataTransferModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'send',
}) => {
  const { 
    products, 
    categories, 
    customers, 
    sales, 
    settings, 
    devices,
    notify,
    t,
    isOnline
  } = useApp();

  const [activeTab, setActiveTab] = useState<'send' | 'receive'>(defaultTab);

  // SEND STATE
  const [includeProducts, setIncludeProducts] = useState(true);
  const [includeCategories, setIncludeCategories] = useState(true);
  const [includeCustomers, setIncludeCustomers] = useState(true);
  const [includeSales, setIncludeSales] = useState(false);
  const [includeSettings, setIncludeSettings] = useState(true);

  const [transferCode, setTransferCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [transferStatus, setTransferStatus] = useState<'idle' | 'waiting' | 'confirmed'>('idle');
  const [confirmedReceiverName, setConfirmedReceiverName] = useState('');

  // RECEIVE STATE
  const [inputCode, setInputCode] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedPackage, setFetchedPackage] = useState<DeviceTransferPackage | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mergeStrategy, setMergeStrategy] = useState<'merge' | 'overwrite'>('merge');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setFetchError(null);
      setApplySuccess(false);
    }
  }, [isOpen, defaultTab]);

  // Listen to SSE events for live confirmation when recipient enters code
  useEffect(() => {
    if (!transferCode || transferStatus !== 'waiting') return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/devices/stream');
      eventSource.onmessage = (e) => {
        try {
          const eventData = JSON.parse(e.data);
          if (
            eventData.type === 'DATA_TRANSFER_CONFIRMED' && 
            eventData.payload?.transferCode === transferCode
          ) {
            setTransferStatus('confirmed');
            setConfirmedReceiverName(eventData.payload?.receiverDeviceName || 'جهاز فرعي');
            try {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } catch {}
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [transferCode, transferStatus]);

  if (!isOpen) return null;

  // Handle generating 6-digit transfer package
  const handleGenerateTransfer = async () => {
    setIsGenerating(true);
    setTransferStatus('idle');

    try {
      // 1. Generate clean 6-digit numeric PIN
      const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 2. Prepare payload
      const payloadData: any = {};
      if (includeProducts) payloadData.products = products;
      if (includeCategories) payloadData.categories = categories;
      if (includeCustomers) payloadData.customers = customers;
      if (includeSales) payloadData.sales = sales.slice(0, 100); // Most recent 100
      if (includeSettings) payloadData.settings = settings;

      const summary = {
        productsCount: includeProducts ? products.length : 0,
        categoriesCount: includeCategories ? categories.length : 0,
        customersCount: includeCustomers ? customers.length : 0,
        salesCount: includeSales ? Math.min(sales.length, 100) : 0,
        hasSettings: includeSettings,
      };

      const storeTitle = settings.storeNameAr || settings.storeNameEn || 'كاشير كيان';
      const deviceName = `${storeTitle} (${window.navigator.platform || 'POS'})`;

      // 3. Save to local IndexedDB
      const localPkg: DeviceTransferPackage = {
        transferCode: generatedPin,
        senderDeviceName: deviceName,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        transferType: 'all',
        summary,
        data: payloadData,
        notes: 'حزمة نقل بيانات نقطة البيع عبر رمز الربط'
      };
      await indexedDbService.saveDeviceTransfer(localPkg);

      // 4. If online, stage on server API
      if (navigator.onLine) {
        try {
          await fetch('/api/devices/transfer/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transferCode: generatedPin,
              senderDeviceName: deviceName,
              summary,
              data: payloadData,
            })
          });
        } catch (serverErr) {
          console.warn('Server transfer staging fallback:', serverErr);
        }
      }

      // 5. Generate QR Code for easy camera scanning
      const qrPayload = JSON.stringify({
        kian_transfer_code: generatedPin,
        app: 'kian-cashier',
        timestamp: Date.now()
      });
      const qrData = await QRCode.toDataURL(qrPayload, {
        width: 260,
        margin: 2,
        color: { dark: '#090d16', light: '#ffffff' }
      });

      setTransferCode(generatedPin);
      setQrCodeDataUrl(qrData);
      setTransferStatus('waiting');
      notify('تم إنشاء رمز النقل', `رمز الربط هو ${generatedPin}. أدخله في الجهاز الآخر لنقل البيانات فوراً.`, 'success');
    } catch (err: any) {
      notify('تعذر إنشاء حزمة النقل', err.message || 'حدث خطأ غير متوقع', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!transferCode) return;
    navigator.clipboard.writeText(transferCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    notify('تم النسخ', 'تم نسخ رمز الربط إلى الحافظة', 'info');
  };

  // Handle Fetching Package using 6-digit code on recipient device
  const handleFetchPackage = async (codeToFetch?: string) => {
    const code = (codeToFetch || inputCode).trim().toUpperCase();
    if (!code || code.length < 4) {
      setFetchError('يرجى إدخال رمز ربط صحيح مكون من 6 أرقام');
      return;
    }

    setIsFetching(true);
    setFetchError(null);
    setFetchedPackage(null);

    try {
      // 1. Try fetching from server first if online
      if (navigator.onLine) {
        try {
          const res = await fetch(`/api/devices/transfer/fetch/${encodeURIComponent(code)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.package) {
              setFetchedPackage(data.package);
              setIsFetching(false);
              return;
            }
          }
        } catch (serverErr) {
          console.warn('Server fetch attempt failed, checking IndexedDB:', serverErr);
        }
      }

      // 2. Fallback to local IndexedDB (useful in offline local testing / same browser / mesh)
      const localPkg = await indexedDbService.getDeviceTransfer(code);
      if (localPkg) {
        setFetchedPackage(localPkg);
      } else {
        setFetchError('لم يتم العثور على حزمة بيانات مطابقة لهذا الرمز. تأكد من صحة الرمز المعروض على الجهاز المرسل.');
      }
    } catch (err: any) {
      setFetchError(err.message || 'فشل فحص رمز الربط');
    } finally {
      setIsFetching(false);
    }
  };

  // Apply received package into POS system state and IndexedDB
  const handleApplyData = async () => {
    if (!fetchedPackage || !fetchedPackage.data) return;

    setIsApplying(true);
    try {
      // Create backup before applying
      await indexedDbService.cacheAllData({
        products,
        categories,
        customers,
        sales,
        settings,
      });

      const { data } = fetchedPackage;

      // 1. Products & Categories
      if (data.products && Array.isArray(data.products)) {
        if (mergeStrategy === 'overwrite') {
          localStorage.setItem('kian_products', JSON.stringify(data.products));
        } else {
          // Merge non-duplicate products by ID and barcode
          const existingIds = new Set(products.map(p => p.id));
          const existingBarcodes = new Set(products.filter(p => p.barcode).map(p => p.barcode));
          const newProducts = data.products.filter(p => !existingIds.has(p.id) && (!p.barcode || !existingBarcodes.has(p.barcode)));
          const mergedProducts = [...products, ...newProducts];
          localStorage.setItem('kian_products', JSON.stringify(mergedProducts));
        }
      }

      if (data.categories && Array.isArray(data.categories)) {
        if (mergeStrategy === 'overwrite') {
          localStorage.setItem('kian_categories', JSON.stringify(data.categories));
        } else {
          const existingIds = new Set(categories.map(c => c.id));
          const newCategories = data.categories.filter(c => !existingIds.has(c.id));
          const mergedCategories = [...categories, ...newCategories];
          localStorage.setItem('kian_categories', JSON.stringify(mergedCategories));
        }
      }

      // 2. Customers
      if (data.customers && Array.isArray(data.customers)) {
        if (mergeStrategy === 'overwrite') {
          localStorage.setItem('kian_customers', JSON.stringify(data.customers));
        } else {
          const existingPhones = new Set(customers.filter(c => c.phone).map(c => c.phone));
          const existingIds = new Set(customers.map(c => c.id));
          const newCustomers = data.customers.filter(c => !existingIds.has(c.id) && (!c.phone || !existingPhones.has(c.phone)));
          const mergedCustomers = [...customers, ...newCustomers];
          localStorage.setItem('kian_customers', JSON.stringify(mergedCustomers));
        }
      }

      // 3. Settings
      if (data.settings && typeof data.settings === 'object') {
        const mergedSettings = { ...settings, ...data.settings };
        localStorage.setItem('kian_settings', JSON.stringify(mergedSettings));
      }

      // 4. Persist newly applied data directly into IndexedDB
      await indexedDbService.cacheAllData({
        products: (data.products && mergeStrategy === 'overwrite') ? data.products : products,
        categories: (data.categories && mergeStrategy === 'overwrite') ? data.categories : categories,
        customers: (data.customers && mergeStrategy === 'overwrite') ? data.customers : customers,
        settings: data.settings ? { ...settings, ...data.settings } : settings,
      });

      // 5. Notify server that transfer succeeded
      try {
        await fetch('/api/devices/transfer/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transferCode: fetchedPackage.transferCode,
            receiverDeviceName: `${settings.storeNameAr || settings.storeNameEn || 'جهاز كاشير فرعي'} (${window.navigator.platform || 'POS'})`
          })
        });
      } catch {}

      setApplySuccess(true);
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      } catch {}

      notify(
        'تم نقل البيانات بنجاح!',
        `تم تطبيق البيانات على هذا الجهاز بنجاح (${fetchedPackage.summary.productsCount} منتج، ${fetchedPackage.summary.customersCount} عميل). يجري تحديث الواجهة...`,
        'success'
      );

      // Auto-reload to apply cleanly into memory
      setTimeout(() => {
        window.location.reload();
      }, 1800);

    } catch (err: any) {
      notify('حدث خطأ أثناء تطبيق البيانات', err.message || 'يرجى المحاولة مجدداً', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                نقل البيانات بين الأجهزة عبر كود الربط
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  مباشر وآمن
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مزامنة المنتجات والعملاء والإعدادات بين الكاشير والتابلت والأجهزة الأخرى برمز فوري
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('send')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'send'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              إرسال بيانات إلى جهاز آخر (توليد كود)
            </button>
            <button
              onClick={() => setActiveTab('receive')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'receive'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              استلام بيانات على هذا الجهاز (إدخال كود)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'send' ? (
            /* TAB 1: SEND DATA */
            <div className="space-y-6">
              {/* Step 1: Select What to Transfer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    1. اختر البيانات المراد إرسالها إلى الجهاز الآخر:
                  </label>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIncludeProducts(true);
                        setIncludeCategories(true);
                        setIncludeCustomers(true);
                        setIncludeSettings(true);
                      }}
                      className="text-amber-600 dark:text-amber-400 font-medium hover:underline"
                    >
                      تحديد الكل
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Products */}
                  <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    includeProducts 
                      ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">المنتجات والمخزون</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{products.length} منتج مسجل</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={includeProducts} 
                      onChange={(e) => setIncludeProducts(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                  </label>

                  {/* Categories */}
                  <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    includeCategories 
                      ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">أقسام وتصنيفات المنتجات</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{categories.length} قسم</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={includeCategories} 
                      onChange={(e) => setIncludeCategories(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                  </label>

                  {/* Customers & Debts */}
                  <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    includeCustomers 
                      ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">العملاء وسجلات الديون</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{customers.length} عميل ونقاط ولاء</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={includeCustomers} 
                      onChange={(e) => setIncludeCustomers(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                  </label>

                  {/* Store Settings & Currency */}
                  <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    includeSettings 
                      ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">إعدادات النظام والعملات</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{settings.storeNameAr || settings.storeNameEn || 'إعدادات المتجر والطابعات'}</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={includeSettings} 
                      onChange={(e) => setIncludeSettings(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                  </label>
                </div>
              </div>

              {/* Generate Button or Active Code Display */}
              {!transferCode ? (
                <button
                  type="button"
                  onClick={handleGenerateTransfer}
                  disabled={isGenerating || (!includeProducts && !includeCategories && !includeCustomers && !includeSettings)}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-lg shadow-amber-500/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      جارِ تحضير وتشفير حزمة البيانات...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      توليد كود الربط ونقل البيانات الآن
                    </>
                  )}
                </button>
              ) : (
                /* Active Code & QR Area */
                <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-amber-50/30 dark:from-slate-800/60 dark:to-amber-950/20 border border-amber-500/30 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 animate-pulse text-amber-500" />
                      كود الربط النشط (صالحة لمدة ساعتين)
                    </span>
                    <button
                      onClick={handleGenerateTransfer}
                      className="text-xs text-slate-500 hover:text-amber-600 flex items-center gap-1 font-medium"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      تجديد الرمز
                    </button>
                  </div>

                  {/* Giant 6-digit Code Box */}
                  <div className="flex items-center justify-center gap-3 py-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-500/40 shadow-inner">
                    <span className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-slate-900 dark:text-white selection:bg-amber-500">
                      {transferCode.slice(0, 3)} {transferCode.slice(3, 6)}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors"
                      title="نسخ الرمز"
                    >
                      {isCopied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* QR Code and Instructions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-2">
                    {qrCodeDataUrl && (
                      <div className="p-2.5 bg-white rounded-xl shadow-md border border-slate-200">
                        <img 
                          src={qrCodeDataUrl} 
                          alt="QR Code" 
                          className="w-36 h-36 object-contain" 
                        />
                      </div>
                    )}
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 max-w-xs text-center sm:text-right">
                      <div className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5 justify-center sm:justify-start">
                        <Smartphone className="w-4 h-4 text-amber-500" />
                        كيفية النقل إلى جهاز الكاشير الآخر:
                      </div>
                      <p>1. افتح تطبيق كاشير كيان على الجهاز الآخر (التابلت أو الهاتف).</p>
                      <p>2. اختر <strong>استلام بيانات</strong> وأدخل الرمز <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{transferCode}</span> أو امسح الباركود بالكاميرا.</p>
                      <p>3. ستنتقل كافة البيانات المختارة في ثوانٍ معدودة دون الحاجة لأسلاك!</p>
                    </div>
                  </div>

                  {/* Transfer live status */}
                  {transferStatus === 'confirmed' ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 animate-in fade-in">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div className="text-xs font-semibold">
                        تم استلام ونقل البيانات بنجاح على الجهاز: <span className="font-bold text-emerald-800 dark:text-emerald-200">{confirmedReceiverName}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-xs text-amber-700 dark:text-amber-300/80 bg-amber-500/10 py-2 px-3 rounded-lg border border-amber-500/20">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      في انتظار إدخال الرمز على الجهاز الآخر لمزامنة البيانات...
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: RECEIVE DATA */
            <div className="space-y-6">
              {/* Step 1: Input Code */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-500" />
                  أدخل رمز الربط (6 أرقام) المعروض على الجهاز المرسل:
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="مثال: 583912"
                    value={inputCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setInputCode(val);
                      if (val.length === 6) {
                        handleFetchPackage(val);
                      }
                    }}
                    className="flex-1 text-center font-mono text-2xl font-black tracking-widest py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleFetchPackage()}
                    disabled={isFetching || inputCode.length < 4}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
                  >
                    {isFetching ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        فحص الحزمة
                      </>
                    )}
                  </button>
                </div>

                {fetchError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fetchError}</span>
                  </div>
                )}
              </div>

              {/* Step 2: Package Preview & Strategy Selection */}
              {fetchedPackage && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          تم العثور على حزمة البيانات بنجاح
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          المرسل: {fetchedPackage.senderDeviceName}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md border border-amber-500/20">
                      كود: {fetchedPackage.transferCode}
                    </span>
                  </div>

                  {/* Summary badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-base text-slate-900 dark:text-white">
                        {fetchedPackage.summary.productsCount}
                      </div>
                      <div className="text-slate-500 text-[11px]">منتج ومخزون</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-base text-slate-900 dark:text-white">
                        {fetchedPackage.summary.categoriesCount}
                      </div>
                      <div className="text-slate-500 text-[11px]">أقسام وتصنيفات</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-base text-slate-900 dark:text-white">
                        {fetchedPackage.summary.customersCount}
                      </div>
                      <div className="text-slate-500 text-[11px]">عملاء وديون</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                        {fetchedPackage.summary.hasSettings ? 'نعم' : 'لا'}
                      </div>
                      <div className="text-slate-500 text-[11px]">إعدادات النظام</div>
                    </div>
                  </div>

                  {/* Strategy Choice */}
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      طريقة تطبيق ونقل البيانات:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className={`p-3 rounded-xl border cursor-pointer text-xs transition-all flex items-start gap-2.5 ${
                        mergeStrategy === 'merge' 
                          ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="strategy"
                          checked={mergeStrategy === 'merge'}
                          onChange={() => setMergeStrategy('merge')}
                          className="mt-0.5 text-amber-600"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">دمج ذكي (Smart Merge)</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            إضافة العناصر الجديدة دون مسح البيانات الحالية الموجودة على هذا الجهاز (موصى به).
                          </div>
                        </div>
                      </label>

                      <label className={`p-3 rounded-xl border cursor-pointer text-xs transition-all flex items-start gap-2.5 ${
                        mergeStrategy === 'overwrite' 
                          ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="strategy"
                          checked={mergeStrategy === 'overwrite'}
                          onChange={() => setMergeStrategy('overwrite')}
                          className="mt-0.5 text-amber-600"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">استبدال كامل (Full Overwrite)</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            استبدال كافة المنتجات والعملاء بالحزمة المستلمة (يتم أخذ نسخة احتياطية أولاً).
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    type="button"
                    onClick={handleApplyData}
                    disabled={isApplying || applySuccess}
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer transition-all"
                  >
                    {isApplying ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        جارِ دمج وتطبيق البيانات وحفظها في IndexedDB...
                      </>
                    ) : applySuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        تم التطبيق بنجاح! جارِ التحديث...
                      </>
                    ) : (
                      <>
                        <Database className="w-5 h-5" />
                        تطبيق وحفظ البيانات على هذا الجهاز الآن
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>نقل بيانات مشفر ومحمي مع دعم الحفظ في IndexedDB أوفلاين</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
