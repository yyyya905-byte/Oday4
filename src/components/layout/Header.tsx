import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sun,
  Moon,
  Search,
  PlusCircle,
  Bell,
  Wifi,
  WifiOff,
  UserCheck,
  Languages,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  UtensilsCrossed,
  Building2,
  Store,
  SlidersHorizontal,
  Sparkles,
  Radio,
  Cloud,
  DollarSign,
  Barcode as BarcodeIcon,
  Coins
} from 'lucide-react';
import { PinSwitchModal } from '../modals/PinSwitchModal';
import { ExchangeBulletinBar } from '../currency/ExchangeBulletinBar';
import { ExchangeBulletinModal } from '../currency/ExchangeBulletinModal';
import { BarcodeDesignerModal } from '../barcode/BarcodeDesignerModal';

export const Header: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    theme,
    themeMode,
    toggleTheme,
    isNightTime,
    currentUser,
    isOnline,
    setActiveTab,
    setIsGlobalSearchOpen,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    settings,
    businessMode,
    setIsModeModalOpen,
    devices
  } = useApp();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isBulletinModalOpen, setIsBulletinModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const onlineDevicesCount = devices.filter(d => d.isOnline).length;

  const modeBadge = {
    restaurant: {
      label: language === 'ar' ? 'مطاعم وكافيهات' : 'Restaurant',
      icon: UtensilsCrossed,
      color: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
    },
    wholesale: {
      label: language === 'ar' ? 'تجارة وجملة' : 'Wholesale',
      icon: Building2,
      color: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
    },
    retail: {
      label: language === 'ar' ? 'مفرق وتجزئة' : 'Retail',
      icon: Store,
      color: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
    }
  }[businessMode];

  const ModeIcon = modeBadge.icon;

  return (
    <>
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors">
      {/* Left / Start Section: Brand & Quick POS Action */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => setActiveTab('pos')} 
          className="flex items-center gap-2.5 cursor-pointer group"
          id="header-brand-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            K
          </div>
          <div className="hidden sm:block leading-tight">
            <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{language === 'ar' ? settings.storeNameAr : settings.storeNameEn}</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md">
                POS
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'نظام كاشير متكامل' : 'Modern Retail System'}
            </p>
          </div>
        </div>

        {/* Quick New Sale Button */}
        <button
          id="btn-quick-new-sale"
          onClick={() => setActiveTab('pos')}
          className="hidden md:flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('newSale')}</span>
        </button>

        {/* Operating POS Mode Switcher Pill */}
        <button
          id="btn-header-operating-mode"
          onClick={() => setIsModeModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-2xs ${modeBadge.color}`}
          title={language === 'ar' ? 'تبديل وضع الكاشير (مطاعم / جملة / مفرق)' : 'Switch POS Mode (Restaurant / Wholesale / Retail)'}
        >
          <ModeIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{modeBadge.label}</span>
          <SlidersHorizontal className="w-3 h-3 opacity-60 ms-0.5" />
        </button>
      </div>

      {/* Center Section: Global Search Bar */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6">
        <button
          id="btn-open-global-search"
          onClick={() => setIsGlobalSearchOpen(true)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors text-start"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="truncate">{t('globalSearch')}</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right / End Section: Status & Controls */}
      <div className="flex items-center gap-2">
        {/* Currency & Exchange Bulletin Button */}
        <button
          id="btn-header-currency-bulletin"
          onClick={() => setIsBulletinModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          title="نشرة أسعار الصرف وحاسبة العملات"
        >
          <Coins className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">نشرة الصرف</span>
          <span className="text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded-md font-mono">
            {settings.currency.symbol}
          </span>
        </button>

        {/* Barcode Designer & Label Printer Button */}
        <button
          id="btn-header-barcode-printer"
          onClick={() => setIsBarcodeModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          title="مصمم وطباعة ملصقات الباركود للمنتجات"
        >
          <BarcodeIcon className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden md:inline">الباركود</span>
        </button>

        {/* Linked Devices Hub Button */}
        <button
          id="btn-header-devices-hub"
          onClick={() => setActiveTab('devices')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          title={language === 'ar' ? 'ربط وإدارة الأجهزة والشاشات' : 'Multi-Device Hub'}
        >
          <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span className="hidden sm:inline">{language === 'ar' ? 'الأجهزة' : 'Devices'}</span>
          <span className="text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.2 rounded-full">
            {onlineDevicesCount}
          </span>
        </button>

        {/* Quick Google Drive Backup Hub Button */}
        <button
          id="btn-header-gdrive-sync"
          onClick={() => setActiveTab('settings')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          title="النسخ الاحتياطي السحابي (Google Drive)"
        >
          <Cloud className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden md:inline">{settings.googleDriveConnected ? 'سحابة Google' : 'نسخ Google'}</span>
        </button>

        {/* Quick Gemini AI Engine Button */}
        <button
          id="btn-header-gemini-ai"
          onClick={() => setActiveTab('ai')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-black shadow-xs hover:scale-105 active:scale-95 transition-all"
          title={language === 'ar' ? 'المساعد الذكي (Gemini AI)' : 'AI Intelligence (Gemini)'}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden md:inline">{language === 'ar' ? 'الذكاء الاصطناعي' : 'Gemini AI'}</span>
        </button>

        {/* Network Online/Offline Status */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isOnline 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
          }`}
          title={isOnline ? t('online') : t('offline')}
        >
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden lg:inline text-[11px]">{t('online')}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden lg:inline text-[11px]">{t('offline')}</span>
            </>
          )}
        </div>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title={t('notifications')}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifDropdownOpen && (
            <div className="absolute end-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{t('notifications')}</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {t('clearAll')}
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    {t('noNotifications')}
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 text-xs flex gap-2.5 items-start hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer ${
                        !n.read ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                      {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      {n.type === 'error' && <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                      {n.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block">
                          {new Date(n.timestamp).toLocaleTimeString(language === 'ar' ? 'ar-SY' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (☀️ / 🌙 / ⏰ Auto) */}
        <button
          id="btn-theme-toggle"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative group"
          title={
            themeMode === 'auto_time'
              ? `الوضع الليلي التلقائي الذكي نشط (${theme === 'dark' ? 'ليلي مريح للعين' : 'نهاري'}) - انقر للتبديل اليدوي`
              : theme === 'dark' ? t('lightMode') : t('darkMode')
          }
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700 group-hover:-rotate-12 transition-transform" />
          )}
          {themeMode === 'auto_time' && (
            <span
              className="absolute -top-0.5 -end-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900"
              title="توقيت تلقائي ذكي"
            />
          )}
        </button>

        {/* Language Switcher */}
        <button
          id="btn-lang-toggle"
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title={t('language')}
        >
          <Languages className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* Staff Switch / Profile Card */}
        <button
          id="btn-user-profile-shift"
          onClick={() => setIsPinModalOpen(true)}
          className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 transition-all text-start"
          title={t('switchCashier')}
        >
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              currentUser.name.charAt(0)
            )}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px]">
              {currentUser.name}
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5" />
              {currentUser.role}
            </span>
          </div>
        </button>
      </div>

      {/* Fast PIN Switch Modal */}
      {isPinModalOpen && (
        <PinSwitchModal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} />
      )}

      {/* Currency Exchange Bulletin & Converter Modal */}
      {isBulletinModalOpen && (
        <ExchangeBulletinModal
          isOpen={isBulletinModalOpen}
          onClose={() => setIsBulletinModalOpen(false)}
        />
      )}

      {/* Barcode Designer & Label Printer Modal */}
      {isBarcodeModalOpen && (
        <BarcodeDesignerModal
          isOpen={isBarcodeModalOpen}
          onClose={() => setIsBarcodeModalOpen(false)}
        />
      )}
    </header>
    <ExchangeBulletinBar />
    </>
  );
};
