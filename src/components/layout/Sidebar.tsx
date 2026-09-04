import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  ReceiptText,
  Package,
  Layers,
  Users,
  Building2,
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
  Truck,
  Boxes,
  Coins
} from 'lucide-react';

interface NavSection {
  title: string;
  badge?: string;
  badgeColor?: string;
  items: {
    id: ActiveTab;
    labelKey: any;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    tag?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, t, products, cart, devices, deliveryVehicles, settings } = useApp();

  const lowStockCount = products.filter(p => p.stock <= p.minStock && p.status === 'active').length;
  const vehiclesOnRoute = deliveryVehicles.filter(v => v.status === 'on_route').length;
  const cartItemsCount = cart.reduce((acc, it) => acc + it.quantity, 0);
  const onlineDevicesCount = devices.filter(d => d.isOnline).length;
  const isGoogleDriveConnected = Boolean(settings.googleDriveConnected);

  const navSections: NavSection[] = [
    {
      title: 'قسم المفرق والتجزئة (Retail)',
      badge: 'مباشر',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      items: [
        {
          id: 'pos',
          labelKey: 'navPOS',
          icon: ReceiptText,
          badge: cartItemsCount > 0 ? cartItemsCount : undefined,
          badgeColor: 'bg-amber-500 text-slate-950 font-black'
        },
        {
          id: 'products',
          labelKey: 'navProducts',
          icon: Package
        },
        {
          id: 'customers',
          labelKey: 'navCustomers',
          icon: Users
        },
        {
          id: 'debts',
          labelKey: 'navDebts',
          icon: Coins,
          tag: 'زبائن وموردين'
        },
        {
          id: 'invoices',
          labelKey: 'navInvoices',
          icon: FileSpreadsheet
        }
      ]
    },
    {
      title: 'قسم الجملة والمستودعات (Wholesale)',
      badge: 'توزيع ونقل',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      items: [
        {
          id: 'trade',
          labelKey: 'navTrade',
          icon: Building2,
          tag: 'جملة وشرائح'
        },
        {
          id: 'inventory',
          labelKey: 'navInventory',
          icon: Layers,
          badge: vehiclesOnRoute > 0 ? vehiclesOnRoute : (lowStockCount > 0 ? lowStockCount : undefined),
          badgeColor: vehiclesOnRoute > 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-rose-500 text-white'
        }
      ]
    },
    {
      title: 'الإدارة والتحليلات والعمليات',
      items: [
        {
          id: 'dashboard',
          labelKey: 'navDashboard',
          icon: LayoutDashboard
        },
        {
          id: 'ai',
          labelKey: 'navAI',
          icon: Sparkles,
          badgeColor: 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white'
        },
        {
          id: 'returns',
          labelKey: 'navReturns',
          icon: RotateCcw
        },
        {
          id: 'expenses',
          labelKey: 'navExpenses',
          icon: Wallet
        },
        {
          id: 'reports',
          labelKey: 'navReports',
          icon: TrendingUp
        },
        {
          id: 'staff',
          labelKey: 'navStaff',
          icon: UserCog
        },
        {
          id: 'devices',
          labelKey: 'navDevices',
          icon: Radio,
          badge: onlineDevicesCount > 0 ? onlineDevicesCount : undefined,
          badgeColor: 'bg-emerald-500 text-white'
        }
      ]
    },
    {
      title: 'النسخ السحابي والنظام',
      items: [
        {
          id: 'settings',
          labelKey: 'navSettings',
          icon: Settings,
          tag: isGoogleDriveConnected ? 'Google Drive متصل' : 'نسخ Google'
        },
        {
          id: 'about',
          labelKey: 'navAbout',
          icon: Info
        }
      ]
    }
  ];

  return (
    <aside className="app-sidebar hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 shrink-0 select-none z-20 transition-colors">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs shadow-amber-500/20">
            K
          </div>
          <div>
            <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white block">
              {t('appName')}
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
              نظام الجملة والمفرق الشامل
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-3 px-3 space-y-4 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>{section.title}</span>
              {section.badge && (
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${section.badgeColor}`}>
                  {section.badge}
                </span>
              )}
            </div>

            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className="truncate">{t(item.labelKey)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.tag && !isActive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {item.tag}
                        </span>
                      )}
                      {item.badge !== undefined && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-slate-950 text-amber-400' : item.badgeColor || 'bg-amber-100 text-amber-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branding & Google Cloud Sync Status */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold text-[10px]">
              {isGoogleDriveConnected ? 'Google Drive متصل' : 'نسخ احتياطي سحابي'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            جاهز
          </span>
        </div>
      </div>
    </aside>
  );
};
