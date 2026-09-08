import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { canAccessTab, getRoleInfo } from '../../utils/permissions';
import {
  ReceiptText,
  LayoutDashboard,
  Package,
  Users,
  Building2,
  MoreHorizontal,
  Layers,
  FileSpreadsheet,
  RotateCcw,
  Wallet,
  TrendingUp,
  UserCog,
  Settings,
  Info,
  Sparkles,
  Radio,
  ShoppingBag,
  Cloud,
  Coins,
  X,
  ShieldCheck
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t, cart, currentUser } = useApp();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const cartCount = cart.reduce((acc, it) => acc + it.quantity, 0);
  const roleInfo = getRoleInfo(currentUser.role);

  const candidateMainTabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'pos', label: t('navPOS'), icon: ReceiptText, badge: cartCount > 0 ? cartCount : undefined },
    { id: 'trade', label: 'تجارة الجملة', icon: Building2 },
    { id: 'products', label: t('navProducts'), icon: Package },
    { id: 'invoices', label: 'الفواتير', icon: FileSpreadsheet },
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
  ];

  const mainTabs = candidateMainTabs.filter(tab => canAccessTab(tab.id, currentUser.role)).slice(0, 4);

  const categorizedMoreTabs = [
    {
      group: 'قسم المفرق والتجزئة (Retail)',
      items: [
        { id: 'pos' as ActiveTab, label: 'كاشير المفرق', icon: ReceiptText },
        { id: 'customers' as ActiveTab, label: 'زبائن المفرق والولاء', icon: Users },
        { id: 'debts' as ActiveTab, label: 'ديون الزبائن والموردين', icon: Coins },
        { id: 'invoices' as ActiveTab, label: 'إيصالات وفواتير المفرق', icon: FileSpreadsheet },
      ]
    },
    {
      group: 'قسم الجملة والمستودعات (Wholesale)',
      items: [
        { id: 'trade' as ActiveTab, label: 'مركز تجارة الجملة والطلبيات', icon: Building2 },
        { id: 'inventory' as ActiveTab, label: 'مستودعات الجملة وسيارات النقل', icon: Layers },
      ]
    },
    {
      group: 'الإدارة والعمليات والنظام',
      items: [
        { id: 'ai' as ActiveTab, label: 'المساعد الذكي AI', icon: Sparkles },
        { id: 'reports' as ActiveTab, label: 'التقارير المالية', icon: TrendingUp },
        { id: 'expenses' as ActiveTab, label: 'المصروفات', icon: Wallet },
        { id: 'returns' as ActiveTab, label: 'المرتجعات', icon: RotateCcw },
        { id: 'devices' as ActiveTab, label: 'الأجهزة المتصلة', icon: Radio },
        { id: 'staff' as ActiveTab, label: 'طاقم العمل', icon: UserCog },
        { id: 'settings' as ActiveTab, label: 'Google Drive والإعدادات', icon: Settings },
        { id: 'about' as ActiveTab, label: 'عن النظام', icon: Info },
      ]
    }
  ]
    .map(cat => ({
      ...cat,
      items: cat.items.filter(item => canAccessTab(item.id, currentUser.role))
    }))
    .filter(cat => cat.items.length > 0);

  return (
    <>
      {/* More menu drawer on mobile */}
      {isMoreMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto space-y-4 pb-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {t('appName')} — جميع أقسام المنظومة
                </h3>
                <p className="text-[11px] text-slate-400">
                  تنقل سريع بين أقسام الجملة والمفرق والعمليات
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 active:scale-90 transition-transform cursor-pointer"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {categorizedMoreTabs.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  {cat.group}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {cat.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMoreMenuOpen(false);
                        }}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border text-right transition-all cursor-pointer active:scale-95 min-h-[46px] ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-500'}`} />
                        <span className="text-xs font-bold truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main bottom navigation bar */}
      <nav className="app-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 px-2 flex items-center justify-around shadow-lg select-none">
        {mainTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full relative transition-all cursor-pointer active:scale-90 ${
                isActive ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -end-2 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 truncate max-w-[70px]">{tab.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          id="mobile-tab-more"
          type="button"
          onClick={() => setIsMoreMenuOpen(true)}
          className="flex-1 flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 cursor-pointer active:scale-90 transition-transform"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-1">الأقسام</span>
        </button>
      </nav>
    </>
  );
};
