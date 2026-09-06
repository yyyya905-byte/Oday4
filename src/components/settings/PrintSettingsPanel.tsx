import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  Sliders,
  CheckCircle2,
  Receipt,
  Tag,
  Maximize2,
  RotateCcw,
  Sparkles,
  Save,
  Info,
  Check,
  ZoomIn,
  ZoomOut,
  Scan,
  Scissors,
  DollarSign,
  QrCode,
  ShieldCheck,
  Eye,
  FileText,
  Volume2,
  VolumeX,
  Store,
  Layers
} from 'lucide-react';
import { PrintPaperSize, LabelAlignmentConfig } from '../../types';
import { generateBarcodeSvg } from '../../utils/barcodeUtils';
import { soundEffects } from '../../services/audio';

interface PaperPreset {
  id: PrintPaperSize;
  title: string;
  widthMm: number;
  heightMm?: number;
  desc: string;
  type: 'receipt' | 'label' | 'sheet';
  badge: string;
}

const PAPER_PRESETS: PaperPreset[] = [
  {
    id: '80mm',
    title: 'رول كاشير عريض (80 مم)',
    widthMm: 80,
    desc: 'الرول الحراري القياسي لمعظم طابعات نقاط البيع والكاشير والمطاعم (عرض الطباعة 72-80 مم - 576 نقطة)',
    type: 'receipt',
    badge: 'الأكثر شيوعاً POS'
  },
  {
    id: '58mm',
    title: 'رول كاشير مدمج (58 مم)',
    widthMm: 58,
    desc: 'لطابعات البلوتوث المحمولة، طابعات الفواتير المصغرة، وأجهزة الدفع المتنقلة POS (384 نقطة)',
    type: 'receipt',
    badge: 'طابعات متنقلة'
  },
  {
    id: '76mm',
    title: 'رول كاشير وسط (76 مم)',
    widthMm: 76,
    desc: 'لطابعات المطبخ والطلبات الحرارية والمصفوفية (Dot Matrix)',
    type: 'receipt',
    badge: 'مطابخ وطلبات'
  },
  {
    id: 'a4',
    title: 'ورق مكتبي كامل (A4)',
    widthMm: 210,
    heightMm: 297,
    desc: 'فواتير رسمية مقاس ورق كامل للشركات، كشوفات الحساب، وفواتير تجارة الجملة الكبيرة',
    type: 'sheet',
    badge: 'فواتير رسمية'
  },
  {
    id: 'label_50x30',
    title: 'ملصق باركود ورفوف (50×30 مم)',
    widthMm: 50,
    heightMm: 30,
    desc: 'المقاس الأكثر استخداماً لملصقات أسعار الرفوف والباركود في محلات السوبرماركت والتجزئة',
    type: 'label',
    badge: 'ملصق رفوف قياسي'
  },
  {
    id: 'label_40x25',
    title: 'ملصق أسعار مدمج (40×25 مم)',
    widthMm: 40,
    heightMm: 25,
    desc: 'للمنتجات الصغيرة، الإكسسوارات، العطور، والعلب المصغرة',
    type: 'label',
    badge: 'ملصق صغير'
  },
  {
    id: 'label_60x40',
    title: 'ملصق طرود وشحن (60×40 مم)',
    widthMm: 60,
    heightMm: 40,
    desc: 'لكراتين تجارة الجملة، مستودعات التوزيع، وبوليصات شحن سيارات النقل',
    type: 'label',
    badge: 'طرود وجملة'
  }
];

export const PrintSettingsPanel: React.FC = () => {
  const { settings, updateSettings, products, notify, formatCurrency, language } = useApp();

  // Local Form State
  const [formData, setFormData] = useState({
    receiptHeader: settings.receiptHeader || 'أهلاً بكم في كيان — نسعد بخدمتكم دائماً',
    receiptFooter: settings.receiptFooter || 'شكراً لزيارتكم! يرجى الاحتفاظ بالفاتورة لضمان حق الاسترجاع خلال 3 أيام.',
    printPaperSize: settings.printPaperSize || '80mm',
    autoPrintOnSale: settings.autoPrintOnSale ?? false,
    autoPrintKitchenTicket: settings.autoPrintKitchenTicket ?? false,
    printCustomerAndMerchantCopies: settings.printCustomerAndMerchantCopies ?? false,
    printBarcodeOnReceipt: settings.printBarcodeOnReceipt ?? true,
    printExchangeRateOnReceipt: settings.printExchangeRateOnReceipt ?? true,
    printStoreLogo: settings.printStoreLogo ?? true,
    printTaxDetails: settings.printTaxDetails ?? true,
    printCashierDetails: settings.printCashierDetails ?? true,
    enableAutoCutter: settings.enableAutoCutter ?? true,
    enableCashDrawerKick: settings.enableCashDrawerKick ?? false,
    soundOnPrint: settings.soundOnPrint ?? true,
    labelAlignment: {
      topMarginMm: settings.labelAlignment?.topMarginMm ?? 2,
      bottomMarginMm: settings.labelAlignment?.bottomMarginMm ?? 2,
      leftMarginMm: settings.labelAlignment?.leftMarginMm ?? 2,
      rightMarginMm: settings.labelAlignment?.rightMarginMm ?? 2,
      textAlign: settings.labelAlignment?.textAlign ?? 'center',
      barcodeAlign: settings.labelAlignment?.barcodeAlign ?? 'center',
      gapOffsetMm: settings.labelAlignment?.gapOffsetMm ?? 3,
      fontScale: settings.labelAlignment?.fontScale ?? 'normal',
      density: settings.labelAlignment?.density ?? 'high',
      showStoreName: settings.labelAlignment?.showStoreName ?? true,
      showProductName: settings.labelAlignment?.showProductName ?? true,
      showPrice: settings.labelAlignment?.showPrice ?? true,
      showBarcode: settings.labelAlignment?.showBarcode ?? true,
      showSku: settings.labelAlignment?.showSku ?? true,
      showDate: settings.labelAlignment?.showDate ?? false
    } as LabelAlignmentConfig
  });

  // Preview & Sandbox State
  const [previewZoom, setPreviewZoom] = useState<number>(1.25);
  const [showRulerGuides, setShowRulerGuides] = useState<boolean>(true);
  const [showCrosshairs, setShowCrosshairs] = useState<boolean>(true);
  const [sampleProductId, setSampleProductId] = useState<string>(products[0]?.id || '');
  const [activePrintMode, setActivePrintMode] = useState<'receipt' | 'calibration' | 'label' | null>(null);

  const sampleProduct = products.find(p => p.id === sampleProductId) || products[0] || {
    id: 'sample_01',
    nameAr: 'شاي سيلاني فاخر 250غ',
    nameEn: 'Ceylon Black Tea 250g',
    price: 35000,
    barcode: '6210984521043',
    sku: 'TEA-043'
  };

  const selectedPreset = PAPER_PRESETS.find(p => p.id === formData.printPaperSize) || PAPER_PRESETS[0];

  const handleSave = () => {
    updateSettings(formData);
    notify('تم الحفظ بنجاح', 'تم تحديث إعدادات الطباعة، مقاسات الرول، ومعايرة المحاذاة', 'success');
  };

  const handleResetAlignmentDefaults = () => {
    setFormData(prev => ({
      ...prev,
      labelAlignment: {
        topMarginMm: 2,
        bottomMarginMm: 2,
        leftMarginMm: 2,
        rightMarginMm: 2,
        textAlign: 'center',
        barcodeAlign: 'center',
        gapOffsetMm: 3,
        fontScale: 'normal',
        density: 'high',
        showStoreName: true,
        showProductName: true,
        showPrice: true,
        showBarcode: true,
        showSku: true,
        showDate: false
      }
    }));
    notify('تمت استعادة القيم الافتراضية', 'تمت إعادة ضبط هوامش ومحاذاة الملصقات إلى الإعدادات القياسية', 'info');
  };

  const handleAdjustMargin = (key: keyof Pick<LabelAlignmentConfig, 'topMarginMm' | 'bottomMarginMm' | 'leftMarginMm' | 'rightMarginMm' | 'gapOffsetMm'>, delta: number) => {
    setFormData(prev => {
      const current = prev.labelAlignment[key];
      const nextVal = Math.max(0, Math.min(25, current + delta));
      return {
        ...prev,
        labelAlignment: {
          ...prev.labelAlignment,
          [key]: nextVal
        }
      };
    });
  };

  // Printing Handlers
  const handlePrintCalibrationSheet = () => {
    setActivePrintMode('calibration');
    if (formData.soundOnPrint) soundEffects.playBeep();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintTestReceipt = () => {
    setActivePrintMode('receipt');
    if (formData.soundOnPrint) soundEffects.playBeep();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintTestLabel = () => {
    setActivePrintMode('label');
    if (formData.soundOnPrint) soundEffects.playBeep();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Generate clean SVG for preview
  const sampleBarcodeSvg = generateBarcodeSvg(sampleProduct.barcode || '6210001234567', {
    width: 180,
    height: 48,
    showText: false,
    barColor: '#000000'
  });

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in">
      {/* Top Banner & Active Status */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/80 to-slate-900 text-white p-6 rounded-3xl border border-amber-500/20 shadow-md relative overflow-hidden">
        <div className="absolute top-0 end-0 translate-x-8 -translate-y-8 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Printer className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-black tracking-tight">إعدادات الطباعة، مقاسات الرول، ومعايرة المحاذاة</h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              تخصيص كامل للطابعات الحرارية (80mm و 58mm)، أوامر قطع الورق ودرج النقدية، ومعايرة محاذاة ملصقات الباركود والرفوف مع مسطرة اختبار حقيقية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </div>

        {/* Quick Spec Pills */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
            <span className="text-slate-400">المقاس النشط:</span>
            <span className="font-bold text-amber-300">{selectedPreset.title}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
            <span className="text-slate-400">الطباعة التلقائية:</span>
            <span className={`font-bold ${formData.autoPrintOnSale ? 'text-emerald-400' : 'text-slate-300'}`}>
              {formData.autoPrintOnSale ? 'مفعلة' : 'يدوية'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
            <span className="text-slate-400">الهوامش الحالية:</span>
            <span className="font-mono text-amber-300 font-bold">
              ع:{formData.labelAlignment.topMarginMm}م | س:{formData.labelAlignment.bottomMarginMm}م | ي:{formData.labelAlignment.rightMarginMm}م | س:{formData.labelAlignment.leftMarginMm}م
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Paper Sizes & Media Dimensions */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-amber-500" />
              <span>اختيار مقاس ورق الطابعة الحرارية والملصقات (Paper & Media Sizes)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              حدد المقاس الفعلي للورق المركّب في طابعتك لضبط هوامش وحدود الفواتير والملصقات تلقائياً
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full self-start sm:self-auto">
            عرض الرول: {selectedPreset.widthMm} مم
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PAPER_PRESETS.map(preset => {
            const isSelected = formData.printPaperSize === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setFormData({ ...formData, printPaperSize: preset.id })}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-start flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 shadow-sm ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-400'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {preset.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                      {preset.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {preset.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>الأبعاد: {preset.widthMm}mm {preset.heightMm ? `× ${preset.heightMm}mm` : '(رول مستمر)'}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {isSelected ? '✓ محدد حالياً' : 'تحديد'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Print Density & Font Scale Options */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              كثافة الحبر الحراري (Thermal Print Density / Contrast)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  labelAlignment: { ...formData.labelAlignment, density: 'normal' }
                })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  formData.labelAlignment.density === 'normal'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                عادي (Standard)
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  labelAlignment: { ...formData.labelAlignment, density: 'high' }
                })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  formData.labelAlignment.density === 'high'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                عالي وداكن (High Contrast - للملصقات)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              حجم خط الإيصال (Receipt Font Scale)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'normal', 'large'] as const).map(scale => (
                <button
                  key={scale}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    labelAlignment: { ...formData.labelAlignment, fontScale: scale }
                  })}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all capitalize ${
                    formData.labelAlignment.fontScale === scale
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  {scale === 'compact' ? 'مدمج (صغير)' : scale === 'normal' ? 'قياسي (متوسط)' : 'عريض (واضح)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Smart Print Toggles & Behavior */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>مفاتيح وخيارات الطباعة الذكية (Print Automation & Features)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            التحكم في الأوامر التلقائية عند البيع، بونات المطبخ، قطع الورق، ودرج النقدية
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 1. Auto Print on Sale */}
          <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                الطباعة التلقائية عند البيع
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                إرسال الإيصال للطابعة فوراً عند تأكيد الدفع
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={formData.autoPrintOnSale}
                onChange={e => setFormData({ ...formData, autoPrintOnSale: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] peer-checked:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 2. Auto Print Kitchen Ticket */}
          <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                طباعة بون تحضير المطبخ
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                إصدار تذكرة تشغيل المطبخ للمطاعم والكافيهات
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={formData.autoPrintKitchenTicket}
                onChange={e => setFormData({ ...formData, autoPrintKitchenTicket: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] peer-checked:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 3. Customer & Merchant Double Copies */}
          <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                طباعة نسختين (عميل + محل)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                نسخة للزبون ونسخة لأرشيف الكاشير تلقائياً
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={formData.printCustomerAndMerchantCopies}
                onChange={e => setFormData({ ...formData, printCustomerAndMerchantCopies: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] peer-checked:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 4. Invoice Barcode & QR Code */}
          <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                باركود ورمز QR الفاتورة
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                للفحص السريع، الاسترجاع، والفوترة الإلكترونية
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={formData.printBarcodeOnReceipt}
                onChange={e => setFormData({ ...formData, printBarcodeOnReceipt: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] peer-checked:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 5. Exchange Rate in Receipt */}
          <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                طباعة أسعار الصرف ($ / €)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                إظهار المعادل بالدولار حسب نشرة الليرة لليوم
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={formData.printExchangeRateOnReceipt}
                onChange={e => setFormData({ ...formData, printExchangeRateOnReceipt: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] peer-checked:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 6. Auto Cutter Signal */}
          <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                أمر قص الورق التلقائي
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                إرسال إشارة قاطع الرول الحراري (ESC/POS Auto Cut)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={formData.enableAutoCutter}
                onChange={e => setFormData({ ...formData, enableAutoCutter: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] peer-checked:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 7. Cash Drawer Kick */}
          <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                فتح درج النقدية تلقائياً
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                نبضة كهربائية لفتح درج الكاشير المعدني مع الطباعة
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={formData.enableCashDrawerKick}
                onChange={e => setFormData({ ...formData, enableCashDrawerKick: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] peer-checked:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 8. Cashier & Shift Details */}
          <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                اسم الكاشير وتوقيت الوردية
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                توثيق اسم الموظف والتاريخ والوقت بالثواني
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={formData.printCashierDetails}
                onChange={e => setFormData({ ...formData, printCashierDetails: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] peer-checked:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 9. Sound on Print */}
          <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                تنبيه صوتي عند الطباعة
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                نغمة تأكيد خفيفة لتنبيه الكاشير بخروج الإيصال
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={formData.soundOnPrint}
                onChange={e => setFormData({ ...formData, soundOnPrint: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] peer-checked:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        {/* Receipt Header & Footer Text */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رسالة ترويسة الإيصال (Header Text)
            </label>
            <input
              type="text"
              value={formData.receiptHeader}
              onChange={e => setFormData({ ...formData, receiptHeader: e.target.value })}
              placeholder="أهلاً بكم في متجرنا"
              className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رسالة تذييل الإيصال وسياسة الاستبدال (Footer Text)
            </label>
            <input
              type="text"
              value={formData.receiptFooter}
              onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
              placeholder="شكراً لزيارتكم! البضاعة ترد وتستبدل خلال 3 أيام"
              className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Label Alignment & Calibration Studio (Interactive Visual Sandbox) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>استوديو معايرة ومحاذاة ملصقات الباركود والرفوف (Label Alignment Studio)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              تحكم دقيق بالهوامش بالمليمتر (mm) مع مسطرة قياس وشبكة محاذاة مرئية لتجنب خروج النصوص عن حواف الورق
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAlignmentDefaults}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة القياسات القياسية</span>
            </button>
          </div>
        </div>

        {/* Layout: Controls on Left / Right, Live Visual Sandbox on the other */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Margin Calibration Numeric Controls */}
            <div className="bg-slate-50/80 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  <span>معايرة الهوامش الدقيقة بالمليمتر (Margins Calibration)</span>
                </span>
                <span className="text-[10px] text-slate-400">خطوة الضبط: 1mm</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Top Margin */}
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    الهامش العلوي
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAdjustMargin('topMarginMm', -1)}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                      {formData.labelAlignment.topMarginMm}mm
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustMargin('topMarginMm', 1)}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bottom Margin */}
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    الهامش السفلي
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAdjustMargin('bottomMarginMm', -1)}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                      {formData.labelAlignment.bottomMarginMm}mm
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustMargin('bottomMarginMm', 1)}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Right Margin */}
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    الهامش الأيمن
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAdjustMargin('rightMarginMm', -1)}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                      {formData.labelAlignment.rightMarginMm}mm
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustMargin('rightMarginMm', 1)}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Left Margin */}
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    الهامش الأيسر
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAdjustMargin('leftMarginMm', -1)}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                      {formData.labelAlignment.leftMarginMm}mm
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustMargin('leftMarginMm', 1)}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Feed Offset / Label Gap */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    فاصل تغذية الملصق (Label Gap / Sensor Offset):
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    المسافة بين كل ملصق والملصق الذي يليه على رول التغذية
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustMargin('gapOffsetMm', -1)}
                    className="w-6 h-6 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                    {formData.labelAlignment.gapOffsetMm}mm
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdjustMargin('gapOffsetMm', 1)}
                    className="w-6 h-6 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Alignment Orientations & Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Text Alignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  محاذاة النصوص والأسعار
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['right', 'center', 'left'] as const).map(align => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        labelAlignment: { ...formData.labelAlignment, textAlign: align }
                      })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                        formData.labelAlignment.textAlign === align
                          ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {align === 'right' ? 'يمين' : align === 'center' ? 'وسط' : 'يسار'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Barcode Alignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  محاذاة خطوط الباركود
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['right', 'center', 'left'] as const).map(align => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        labelAlignment: { ...formData.labelAlignment, barcodeAlign: align }
                      })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                        formData.labelAlignment.barcodeAlign === align
                          ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {align === 'right' ? 'يمين' : align === 'center' ? 'وسط' : 'يسار'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Elements Display Toggles */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                العناصر المضمنة في الملصق
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'showStoreName', label: 'اسم المتجر' },
                  { key: 'showProductName', label: 'اسم الصنف' },
                  { key: 'showPrice', label: 'سعر البيع' },
                  { key: 'showBarcode', label: 'خطوط الباركود' },
                  { key: 'showSku', label: 'رمز SKU' },
                  { key: 'showDate', label: 'تاريخ الطباعة' }
                ].map(el => {
                  const isChecked = (formData.labelAlignment as any)[el.key];
                  return (
                    <label
                      key={el.key}
                      className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => setFormData({
                          ...formData,
                          labelAlignment: {
                            ...formData.labelAlignment,
                            [el.key]: e.target.checked
                          }
                        })}
                        className="w-3.5 h-3.5 accent-amber-500 rounded"
                      />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{el.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Test Sample Product Picker */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الصنف التجريبي للمعاينة والاختبار
              </label>
              <select
                value={sampleProductId}
                onChange={e => setSampleProductId(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                {products.slice(0, 15).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nameAr} — {formatCurrency(p.price)} ({p.barcode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Visual Sandbox & Rulers Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-100/90 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
            {/* Sandbox Toolbar */}
            <div className="w-full flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-black text-slate-800 dark:text-slate-200">معاينة المحاذاة الحية</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowRulerGuides(!showRulerGuides)}
                  className={`p-1 rounded-md text-[10px] font-bold ${
                    showRulerGuides ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'text-slate-400'
                  }`}
                  title="إظهار/إخفاء المسطرة"
                >
                  المسطرة
                </button>
                <button
                  type="button"
                  onClick={() => setShowCrosshairs(!showCrosshairs)}
                  className={`p-1 rounded-md text-[10px] font-bold ${
                    showCrosshairs ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'text-slate-400'
                  }`}
                  title="إظهار/إخفاء خطوط المنتصف"
                >
                  التقاطع
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(z => Math.max(0.8, Number((z - 0.2).toFixed(1))))}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 w-8 text-center">{Math.round(previewZoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(z => Math.min(2.0, Number((z + 0.2).toFixed(1))))}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Canvas Area */}
            <div className="w-full flex items-center justify-center p-4 min-h-[300px] overflow-auto">
              <div
                style={{
                  transform: `scale(${previewZoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease'
                }}
                className="relative"
              >
                {/* Horizontal Millimeter Ticks (Ruler) */}
                {showRulerGuides && (
                  <div className="absolute -top-5 left-0 right-0 h-4 flex justify-between text-[8px] font-mono text-slate-400 select-none border-b border-slate-300 dark:border-slate-700 px-1">
                    <span>0</span>
                    <span>10mm</span>
                    <span>20mm</span>
                    <span>30mm</span>
                    <span>40mm</span>
                    <span>50mm</span>
                  </div>
                )}

                {/* Vertical Millimeter Ticks (Ruler) */}
                {showRulerGuides && (
                  <div className="absolute top-0 -left-6 bottom-0 w-5 flex flex-col justify-between text-[8px] font-mono text-slate-400 select-none border-e border-slate-300 dark:border-slate-700 py-1 text-end pe-1">
                    <span>0</span>
                    <span>10</span>
                    <span>20</span>
                    <span>30</span>
                  </div>
                )}

                {/* Center Crosshairs Overlay */}
                {showCrosshairs && (
                  <>
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-red-400/40 border-r border-dashed border-red-500 pointer-events-none z-20" />
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-red-400/40 border-b border-dashed border-red-500 pointer-events-none z-20" />
                  </>
                )}

                {/* Simulated Thermal Label Container */}
                <div
                  className="bg-white text-slate-950 shadow-xl border border-slate-300 rounded-md relative select-none"
                  style={{
                    width: `${Math.min(260, selectedPreset.widthMm * 3.4)}px`,
                    minHeight: selectedPreset.heightMm ? `${selectedPreset.heightMm * 3.4}px` : '180px',
                    paddingTop: `${formData.labelAlignment.topMarginMm * 3.4}px`,
                    paddingBottom: `${formData.labelAlignment.bottomMarginMm * 3.4}px`,
                    paddingRight: `${formData.labelAlignment.rightMarginMm * 3.4}px`,
                    paddingLeft: `${formData.labelAlignment.leftMarginMm * 3.4}px`
                  }}
                >
                  {/* Safety Margins Guide Box (Dashed Cyan Boundary) */}
                  <div
                    className="w-full h-full border border-dashed border-cyan-500/50 rounded flex flex-col justify-between p-1 relative"
                    style={{
                      textAlign: formData.labelAlignment.textAlign
                    }}
                  >
                    {/* Top: Store Name */}
                    {formData.labelAlignment.showStoreName && (
                      <div className="text-[10px] font-bold text-slate-600 truncate border-b border-dashed border-slate-200 pb-0.5">
                        {settings.storeNameAr}
                      </div>
                    )}

                    {/* Middle: Product Name & SKU */}
                    <div className="my-1 space-y-0.5">
                      {formData.labelAlignment.showProductName && (
                        <h4 className="text-xs font-black text-slate-900 leading-tight">
                          {sampleProduct.nameAr}
                        </h4>
                      )}
                      {formData.labelAlignment.showSku && (
                        <span className="text-[9px] font-mono text-slate-500 block">
                          SKU: {sampleProduct.sku || 'N/A'}
                        </span>
                      )}
                    </div>

                    {/* Barcode Vector Graphic */}
                    {formData.labelAlignment.showBarcode && (
                      <div
                        className="my-1 flex"
                        style={{
                          justifyContent: formData.labelAlignment.barcodeAlign === 'right' ? 'flex-end' : formData.labelAlignment.barcodeAlign === 'left' ? 'flex-start' : 'center'
                        }}
                      >
                        <div
                          dangerouslySetInnerHTML={{ __html: sampleBarcodeSvg }}
                          className="w-full flex justify-center [&>svg]:max-h-11"
                        />
                      </div>
                    )}

                    {/* Bottom: Price & Expiry Date */}
                    <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-0.5 mt-0.5 text-xs">
                      {formData.labelAlignment.showPrice && (
                        <div className="font-black text-slate-950 font-mono text-sm leading-none">
                          {formatCurrency(sampleProduct.price)}
                        </div>
                      )}
                      {formData.labelAlignment.showDate && (
                        <span className="text-[8px] text-slate-400 font-mono">
                          {new Date().toLocaleDateString(language === 'ar' ? 'ar-SY' : 'en-US')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sandbox Legend */}
            <div className="w-full pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>إطار الهوامش الآمنة</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>نقطة المركز والتقاطع</span>
              </span>
              <span className="font-mono text-amber-600 dark:text-amber-400">
                {selectedPreset.widthMm}mm رول
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Live Test Actions & Diagnostic Prints */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>الاختبار الفعلي وأوامر الطباعة التجريبية (Live Test Printing Actions)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            أرسل أوامر تجريبية حقيقية لطابعتك للتحقق من سلامة المحاذاة، حدة الحبر الحراري، وقابلية قراءة الباركود
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Test 1: Calibration Test Sheet */}
          <button
            type="button"
            onClick={handlePrintCalibrationSheet}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-start space-y-1.5 transition-all cursor-pointer group hover:border-amber-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                <Maximize2 className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                معايرة هندسية
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              طباعة صفحة معايرة المحاذاة
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              تطبع شبكة مليمترية دقيقة مع أهداف التقاطع لاختبار انحراف الورق ومطابقته بالمسطرة
            </p>
          </button>

          {/* Test 2: Sample Receipt Print */}
          <button
            type="button"
            onClick={handlePrintTestReceipt}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-start space-y-1.5 transition-all cursor-pointer group hover:border-amber-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                <Receipt className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {selectedPreset.title.split(' ')[0]}
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              طباعة إيصال كاشير تجريبي
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              تطبع فاتورة مبيعات نموذجية وفق مقاس الورق المختار ({selectedPreset.widthMm}mm) مع الترويسة والباركود
            </p>
          </button>

          {/* Test 3: Sample Label Print */}
          <button
            type="button"
            onClick={handlePrintTestLabel}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-start space-y-1.5 transition-all cursor-pointer group hover:border-amber-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                <Tag className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                ملصق صنف
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              طباعة ملصق باركود تجريبي
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              تطبع ملصق الصنف ({sampleProduct.nameAr}) بالهوامش المخصصة مباشرة على طابعة الباركود
            </p>
          </button>
        </div>
      </div>

      {/* HIDDEN PRINTABLE ELEMENTS FOR BROWSER PRINT TRIGGER */}

      {/* 1. Printable Calibration Sheet */}
      {activePrintMode === 'calibration' && (
        <div id="printable-calibration-sheet" className="hidden font-sans text-black">
          <div style={{ width: `${selectedPreset.widthMm || 80}mm`, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 2px 0' }}>ورقة معايرة ومحاذاة الطباعة</h2>
              <p style={{ fontSize: '10px', margin: 0 }}>نظام كيان كاشير • المقاس: {selectedPreset.title}</p>
            </div>

            {/* Millimeter Ruler Pattern */}
            <div style={{ border: '1px solid #000', height: '25px', position: 'relative', margin: '8px 0', background: '#fff' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', borderBottom: '1px solid #000', display: 'flex', justifyContent: 'space-between', fontSize: '7px', padding: '0 2px' }}>
                <span>0</span>
                <span>10mm</span>
                <span>20mm</span>
                <span>30mm</span>
                <span>40mm</span>
                <span>50mm</span>
                <span>60mm</span>
                <span>70mm</span>
              </div>
              <div style={{ position: 'absolute', bottom: '2px', left: 0, right: 0, fontSize: '8px', textAlign: 'center' }}>
                مسطرة مطابقة 100% (تأكد من عدم تصغير الحجم عند الطباعة)
              </div>
            </div>

            {/* Target Crosshairs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0', fontSize: '9px' }}>
              <div style={{ border: '1px dashed #000', padding: '4px', width: '30%' }}>
                + هدف اليمين
              </div>
              <div style={{ border: '1px solid #000', padding: '4px', width: '30%', fontWeight: 'bold' }}>
                ✛ هدف المركز
              </div>
              <div style={{ border: '1px dashed #000', padding: '4px', width: '30%' }}>
                + هدف اليسار
              </div>
            </div>

            {/* Current Config Values */}
            <div style={{ border: '1px solid #000', padding: '6px', fontSize: '9px', textAlign: 'start', margin: '8px 0' }}>
              <div><b>الهوامش المطبقة:</b></div>
              <div>علوي: {formData.labelAlignment.topMarginMm}mm | سفلي: {formData.labelAlignment.bottomMarginMm}mm</div>
              <div>أيمن: {formData.labelAlignment.rightMarginMm}mm | أيسر: {formData.labelAlignment.leftMarginMm}mm</div>
              <div>فاصل التغذية: {formData.labelAlignment.gapOffsetMm}mm</div>
            </div>

            {/* Barcode Test */}
            <div style={{ margin: '8px 0' }}>
              <div dangerouslySetInnerHTML={{ __html: sampleBarcodeSvg }} style={{ display: 'flex', justifyContent: 'center' }} />
              <div style={{ fontSize: '9px', fontFamily: 'monospace' }}>6210984521043</div>
              <div style={{ fontSize: '8px', color: '#666' }}>افحص هذا الباركود بمسدس الليزر للتأكد من سهولة القراءة</div>
            </div>

            <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', fontSize: '8px' }}>
              تاريخ وتوقيت الاختبار: {new Date().toLocaleString('ar-SY')}
            </div>
          </div>
        </div>
      )}

      {/* 2. Printable Sample Receipt */}
      {activePrintMode === 'receipt' && (
        <div id="printable-receipt" className="hidden font-sans text-black">
          <div style={{ width: `${selectedPreset.widthMm || 80}mm`, margin: '0 auto', textAlign: 'center', fontSize: '11px' }}>
            <div style={{ borderBottom: '1px dashed #000', paddingBottom: '6px', marginBottom: '6px' }}>
              {formData.printStoreLogo && (
                <div style={{ fontSize: '16px', fontWeight: '900', marginBottom: '2px' }}>{settings.storeNameAr}</div>
              )}
              <div style={{ fontSize: '9px', color: '#444' }}>{settings.storeNameEn}</div>
              <div style={{ fontSize: '10px' }}>{settings.address}</div>
              <div style={{ fontSize: '10px' }}>هاتف: {settings.phone}</div>
              {formData.printTaxDetails && settings.taxNumber && (
                <div style={{ fontSize: '9px' }}>الرقم الضريبي: {settings.taxNumber}</div>
              )}
            </div>

            {formData.receiptHeader && (
              <div style={{ fontSize: '10px', fontStyle: 'italic', marginBottom: '6px' }}>
                {formData.receiptHeader}
              </div>
            )}

            <div style={{ textAlign: 'start', fontSize: '10px', borderBottom: '1px dashed #000', paddingBottom: '4px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>رقم الفاتورة:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>INV-2026-TEST</span>
              </div>
              {formData.printCashierDetails && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>الكاشير:</span>
                    <span>كاشير تجريبي (الوردية 1)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>التاريخ والوقت:</span>
                    <span>{new Date().toLocaleString('ar-SY')}</span>
                  </div>
                </>
              )}
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', marginBottom: '6px', textAlign: 'start' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <th style={{ textAlign: 'start', padding: '2px 0' }}>الصنف</th>
                  <th style={{ textAlign: 'center', padding: '2px 0' }}>الكمية</th>
                  <th style={{ textAlign: 'end', padding: '2px 0' }}>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 0' }}>{sampleProduct.nameAr}</td>
                  <td style={{ textAlign: 'center', padding: '3px 0' }}>2</td>
                  <td style={{ textAlign: 'end', padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(sampleProduct.price * 2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0' }}>مياه معدنية 500 مل</td>
                  <td style={{ textAlign: 'center', padding: '3px 0' }}>1</td>
                  <td style={{ textAlign: 'end', padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(3000)}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', marginBottom: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                <span>المجموع النهائي:</span>
                <span>{formatCurrency(sampleProduct.price * 2 + 3000)}</span>
              </div>
            </div>

            {formData.printExchangeRateOnReceipt && settings.exchangeBulletin && (
              <div style={{ fontSize: '9px', border: '1px solid #000', padding: '3px', margin: '6px 0' }}>
                المعادل بالدولار تقريباً: ${( (sampleProduct.price * 2 + 3000) / (settings.exchangeBulletin.usdSellRate || 14800) ).toFixed(2)} USD
              </div>
            )}

            {formData.printBarcodeOnReceipt && (
              <div style={{ margin: '8px 0' }}>
                <div dangerouslySetInnerHTML={{ __html: sampleBarcodeSvg }} style={{ display: 'flex', justifyContent: 'center' }} />
                <div style={{ fontSize: '9px', fontFamily: 'monospace' }}>INV-2026-TEST</div>
              </div>
            )}

            {formData.receiptFooter && (
              <div style={{ fontSize: '9px', borderTop: '1px dashed #000', paddingTop: '6px', color: '#444' }}>
                {formData.receiptFooter}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Printable Test Label */}
      {activePrintMode === 'label' && (
        <div id="printable-test-label" className="hidden font-sans text-black">
          <div
            style={{
              width: `${selectedPreset.widthMm || 50}mm`,
              minHeight: `${selectedPreset.heightMm || 30}mm`,
              paddingTop: `${formData.labelAlignment.topMarginMm}mm`,
              paddingBottom: `${formData.labelAlignment.bottomMarginMm}mm`,
              paddingRight: `${formData.labelAlignment.rightMarginMm}mm`,
              paddingLeft: `${formData.labelAlignment.leftMarginMm}mm`,
              textAlign: formData.labelAlignment.textAlign,
              margin: '0 auto',
              boxSizing: 'border-box'
            }}
          >
            {formData.labelAlignment.showStoreName && (
              <div style={{ fontSize: '9px', fontWeight: 'bold', borderBottom: '1px dashed #000', paddingBottom: '2px', marginBottom: '3px' }}>
                {settings.storeNameAr}
              </div>
            )}

            {formData.labelAlignment.showProductName && (
              <div style={{ fontSize: '11px', fontWeight: 'bold', margin: '2px 0' }}>
                {sampleProduct.nameAr}
              </div>
            )}

            {formData.labelAlignment.showSku && (
              <div style={{ fontSize: '8px', fontFamily: 'monospace', color: '#333' }}>
                SKU: {sampleProduct.sku || 'N/A'}
              </div>
            )}

            {formData.labelAlignment.showBarcode && (
              <div style={{ margin: '3px 0', display: 'flex', justifyContent: formData.labelAlignment.barcodeAlign === 'right' ? 'flex-end' : formData.labelAlignment.barcodeAlign === 'left' ? 'flex-start' : 'center' }}>
                <div dangerouslySetInnerHTML={{ __html: sampleBarcodeSvg }} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #000', paddingTop: '2px', marginTop: '2px' }}>
              {formData.labelAlignment.showPrice && (
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {formatCurrency(sampleProduct.price)}
                </div>
              )}
              {formData.labelAlignment.showDate && (
                <div style={{ fontSize: '7px', color: '#666' }}>
                  {new Date().toLocaleDateString('ar-SY')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
