import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StockMovementType, Product } from '../../types';
import {
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  RotateCcw,
  Plus,
  Minus,
  DollarSign,
  Package,
  History,
  X,
  CheckCircle2,
  FileSpreadsheet,
  Truck,
  Building2,
  ArrowLeftRight,
  BellRing,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { VehicleDispatchTab } from './VehicleDispatchTab';
import { WholesaleWarehousesTab } from './WholesaleWarehousesTab';
import { LowStockAlertsCenter } from './LowStockAlertsCenter';

export const InventoryView: React.FC = () => {
  const {
    products,
    stockMovements,
    deliveryVehicles,
    wholesaleWarehouses,
    adjustStock,
    formatCurrency,
    t,
    language,
    settings,
    notify,
  } = useApp();

  // Active top-level inventory tab
  const [activeTab, setActiveTab] = useState<
    'low_stock_alerts' | 'fleet_dispatch' | 'stock_levels' | 'wholesale_depots' | 'audit_ledger'
  >('low_stock_alerts');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<StockMovementType>('purchase');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>('');

  // Total Inventory Valuation (at cost & at retail)
  const totalValuationCost = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  const totalValuationRetail = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;
  const totalAlertsCount = lowStockCount + outOfStockCount;

  // Active in-transit vehicles count
  const vehiclesOnRoute = deliveryVehicles.filter((v) => v.status === 'on_route').length;

  const openAdjustModal = (product: Product, defaultType: StockMovementType = 'purchase') => {
    setSelectedProduct(product);
    setMovementType(defaultType);
    setQuantity(defaultType === 'purchase' ? 20 : 1);
    setReason('');
    setIsAdjustModalOpen(true);
  };

  const handleConfirmAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0) return;

    adjustStock(
      selectedProduct.id,
      movementType,
      Number(quantity),
      reason || 'تعديل يدوي من إدارة المخزون'
    );
    notify('تم بنجاح', `تم تحديث مخزون ${selectedProduct.nameAr}`, 'success');
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('inventoryTitle')}</span>
            <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full">
              رقابة المستودعات والتنبيهات وسيارات النقل والجملة
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تنبيهات النقص التلقائي، متابعة وتفريغ حمولات سيارات النقل، مستودعات الجملة، ومستويات المخزون
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {/* TAB 1: LOW STOCK ALERTS CENTER */}
        <button
          type="button"
          onClick={() => setActiveTab('low_stock_alerts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
            activeTab === 'low_stock_alerts'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <BellRing className={`w-4 h-4 ${totalAlertsCount > 0 ? 'text-rose-400 animate-pulse' : ''}`} />
          <span>🚨 تنبيهات النقص التلقائي والحد الأدنى</span>
          {totalAlertsCount > 0 ? (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'low_stock_alerts' ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'
            }`}>
              {totalAlertsCount} تنبيه
            </span>
          ) : (
            <span className="text-[10px] text-emerald-500 font-bold">✓ مكتمل</span>
          )}
        </button>

        {/* TAB 2: TRANSPORT VEHICLES & FLEET */}
        <button
          type="button"
          onClick={() => setActiveTab('fleet_dispatch')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
            activeTab === 'fleet_dispatch'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>سيارات النقل وتفريغ/تحميل المستودع</span>
          {vehiclesOnRoute > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-950 text-amber-400">
              {vehiclesOnRoute} نشطة
            </span>
          )}
        </button>

        {/* TAB 3: GENERAL STOCK LEVELS */}
        <button
          type="button"
          onClick={() => setActiveTab('stock_levels')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
            activeTab === 'stock_levels'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>المخزون العام والتوريد</span>
          <span className="font-mono text-[10px] text-slate-400">
            ({products.length} صنف)
          </span>
        </button>

        {/* TAB 4: WHOLESALE DEPOTS */}
        <button
          type="button"
          onClick={() => setActiveTab('wholesale_depots')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
            activeTab === 'wholesale_depots'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>مستودعات الجملة المركزية</span>
          <span className="font-mono text-[10px] text-slate-400">
            ({wholesaleWarehouses.length})
          </span>
        </button>

        {/* TAB 5: AUDIT LEDGER */}
        <button
          type="button"
          onClick={() => setActiveTab('audit_ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
            activeTab === 'audit_ledger'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل حركات وتدقيق المخزون</span>
        </button>
      </div>

      {/* TAB 1: LOW STOCK ALERTS CENTER */}
      {activeTab === 'low_stock_alerts' && (
        <LowStockAlertsCenter onOpenAdjustModal={openAdjustModal} />
      )}

      {/* TAB 2: Transport Vehicles & Dispatch */}
      {activeTab === 'fleet_dispatch' && <VehicleDispatchTab />}

      {/* TAB 3: Wholesale Warehouses & Inter-Depot Transfers */}
      {activeTab === 'wholesale_depots' && <WholesaleWarehousesTab />}

      {/* TAB 4: General Stock Levels & Restock */}
      {activeTab === 'stock_levels' && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Inventory Value at Cost */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t('inventoryValue')} (بسعر التكلفة)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(totalValuationCost)}
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                القيمة بسعر البيع المتوقع: {formatCurrency(totalValuationRetail)}
              </p>
            </div>

            {/* Total Stock Units */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                إجمالي القطع في المستودع
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {products.reduce((acc, p) => acc + p.stock, 0)} قطعة
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                عبر {products.length} صنف مسجل
              </p>
            </div>

            {/* Low Stock count */}
            <div
              onClick={() => setActiveTab('low_stock_alerts')}
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-amber-300 dark:border-amber-800 shadow-xs space-y-2 cursor-pointer hover:bg-amber-50/50 transition-colors"
            >
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between">
                <span>أصناف منخفضة (تحت حد الطلب)</span>
                <span className="text-[10px] text-amber-600 underline">عرض ➔</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-amber-500 font-mono">
                {lowStockCount} أصناف
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                تحتاج لإصدار أمر شراء عاجل
              </p>
            </div>

            {/* Out of Stock */}
            <div
              onClick={() => setActiveTab('low_stock_alerts')}
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-rose-300 dark:border-rose-800 shadow-xs space-y-2 cursor-pointer hover:bg-rose-50/50 transition-colors"
            >
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
                <span>أصناف نافذة (مخزون صفر)</span>
                <span className="text-[10px] text-rose-600 underline">عرض ➔</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {outOfStockCount} أصناف
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                غير متوفرة للبيع حالياً
              </p>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <span>جدول مستويات المخزون وحركات التوريد السريع</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 text-start">المنتج</th>
                    <th className="py-3 px-3 text-start">الباركود</th>
                    <th className="py-3 px-3 text-center">المخزون الحالي</th>
                    <th className="py-3 px-3 text-center">حد الطلب (الحد الأدنى)</th>
                    <th className="py-3 px-3 text-end">سعر التكلفة</th>
                    <th className="py-3 px-3 text-end">قيمة المخزون</th>
                    <th className="py-3 px-3 text-center">الحالة</th>
                    <th className="py-3 px-4 text-end">عمليات التوريد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products.map((product) => {
                    const isOutOfStock = product.stock <= 0;
                    const isLowStock = product.stock <= product.minStock && !isOutOfStock;
                    const valCost = product.costPrice * product.stock;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {product.nameAr}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">
                          <div>{product.barcode}</div>
                          {product.identificationCodes && product.identificationCodes.length > 0 && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                              {product.identificationCodes.length} كود إضافي
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                          {product.stock} {product.unit}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-500">
                          {product.minStock} {product.unit}
                        </td>
                        <td className="py-3 px-3 text-end font-mono text-slate-500">
                          {formatCurrency(product.costPrice)}
                        </td>
                        <td className="py-3 px-3 text-end font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(valCost)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isOutOfStock
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                                : isLowStock
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {isOutOfStock
                              ? 'نفذ المخزون'
                              : isLowStock
                              ? 'منخفض (تحت حد الأمان)'
                              : 'متوفر'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openAdjustModal(product, 'purchase')}
                              className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              + توريد
                            </button>
                            <button
                              type="button"
                              onClick={() => openAdjustModal(product, 'damage')}
                              className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              - تالف
                            </button>
                            <button
                              type="button"
                              onClick={() => openAdjustModal(product, 'adjustment')}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="جرد يدوي"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Stock Movement & Audit Ledger History */}
      {activeTab === 'audit_ledger' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" />
              <span>سجل الحركات المخزنية والتحويلات والإخراجات الشامل</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {(stockMovements || []).length} حركة مسجلة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-2 text-start">المنتج</th>
                  <th className="pb-2 text-start">نوع الحركة</th>
                  <th className="pb-2 text-center">الكمية</th>
                  <th className="pb-2 text-center">المخزون (قبل / بعد)</th>
                  <th className="pb-2 text-start">السبب / بيان السند</th>
                  <th className="pb-2 text-start">المسؤول</th>
                  <th className="pb-2 text-end">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!stockMovements || stockMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      لا توجد حركات مخزنية مسجلة
                    </td>
                  </tr>
                ) : (
                  (stockMovements || []).map((m: any) => (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                        {m.productNameAr || m.productName || 'صنف'}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            m.type === 'purchase' ||
                            m.type === 'restock' ||
                            m.type === 'return' ||
                            m.type === 'vehicle_return'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                              : m.type === 'vehicle_dispatch'
                              ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                              : m.type === 'warehouse_transfer'
                              ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400'
                              : m.type === 'sale'
                              ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                              : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {m.type === 'vehicle_dispatch'
                            ? 'إخراج لسيارة نقل 🚛'
                            : m.type === 'vehicle_return'
                            ? 'مرتجع من سيارة نقل 🔄'
                            : m.type === 'warehouse_transfer'
                            ? 'تحويل بين مستودعات 🏢'
                            : m.type === 'purchase' || m.type === 'restock'
                            ? 'توريد مشتريات'
                            : m.type === 'sale'
                            ? 'بيع للعميل'
                            : m.type === 'damage'
                            ? 'تالف / هالك'
                            : m.type === 'return'
                            ? 'مرتجع بيع'
                            : 'تعديل جردي'}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-mono font-bold">
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="py-2.5 text-center font-mono text-slate-500">
                        {m.previousStock} ➔ {m.newStock}
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">
                        {m.reason || '—'}
                      </td>
                      <td className="py-2.5 text-slate-700 dark:text-slate-300 font-medium">
                        {m.createdByName || m.userName || 'النظام'}
                      </td>
                      <td className="py-2.5 text-end text-slate-400 font-mono">
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleString(
                              language === 'ar' ? 'ar-SY' : 'en-US'
                            )
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                تعديل مخزون: {selectedProduct.nameAr}
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjustment} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/40 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                <span>المخزون الحالي المسجل:</span>
                <span className="font-mono text-base">
                  {selectedProduct.stock} {selectedProduct.unit}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع العملية المخزنية
                </label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as StockMovementType)}
                  className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="purchase">توريد بضاعة جديدة (+ زيادة المخزون)</option>
                  <option value="damage">تسجيل بضاعة تالفة / منتهية الصلاحية (- خصم من المخزون)</option>
                  <option value="adjustment">جرد يدوي / تصحيح خطأ عد</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الكمية ({selectedProduct.unit})
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  السبب أو رقم فاتورة التوريد
                </label>
                <input
                  type="text"
                  placeholder="مثال: فاتورة المورّد رقم 5412"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  تأكيد التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
