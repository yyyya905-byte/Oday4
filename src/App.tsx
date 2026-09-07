import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { POSView } from './components/pos/POSView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { TradeView } from './components/trade/TradeView';
import { InventoryView } from './components/inventory/InventoryView';
import { CustomersView } from './components/customers/CustomersView';
import { DebtView } from './components/debts/DebtView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { ReturnsView } from './components/returns/ReturnsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { StaffView } from './components/staff/StaffView';
import { SettingsView } from './components/settings/SettingsView';
import { AboutView } from './components/about/AboutView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { DevicesHubView } from './components/devices/DevicesHubView';
import { KitchenDisplayView } from './components/devices/KitchenDisplayView';
import { CustomerFacingDisplayView } from './components/devices/CustomerFacingDisplayView';
import { MobileWaiterView } from './components/devices/MobileWaiterView';
import { MobileStockScannerView } from './components/devices/MobileStockScannerView';
import { DeviceDataTransferModal } from './components/devices/DeviceDataTransferModal';
import { ConnectToCashierModal } from './components/devices/ConnectToCashierModal';
import { DataUsageSummaryWidget } from './components/common/DataUsageSummaryWidget';
import { PinSwitchModal } from './components/modals/PinSwitchModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { ModeSelectionModal } from './components/modals/ModeSelectionModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { WifiOff, RefreshCw, ArrowLeftRight, Database, CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    isPinModalOpen, 
    setIsPinModalOpen, 
    isSearchModalOpen, 
    setIsSearchModalOpen,
    isModeModalOpen,
    setIsModeModalOpen,
    dedicatedDeviceRole,
    setDedicatedDeviceRole,
    isDataTransferModalOpen,
    setIsDataTransferModalOpen,
    isConnectToCashierModalOpen,
    setIsConnectToCashierModalOpen,
    offlineQueueCount,
    isSyncingOffline,
    syncOfflineQueueNow,
    isOnline
  } = useApp();

  // PWA Service Worker Registration & Background Sync Listener
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('[PWA SW] Successfully registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PWA SW] Registration failed:', error);
          });
      });

      // Listen for background sync triggers from Service Worker
      const handleSwMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'TRIGGER_OFFLINE_SYNC') {
          console.log('[App] Received background sync trigger from Service Worker');
          syncOfflineQueueNow();
        }
      };

      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, [syncOfflineQueueNow]);

  // If this device was paired or selected as a dedicated terminal
  if (dedicatedDeviceRole === 'kitchen_display') {
    return <KitchenDisplayView onBackToMain={() => {
      setDedicatedDeviceRole(null);
      try { localStorage.removeItem('kian_dedicated_device_role'); } catch {}
    }} />;
  }
  if (dedicatedDeviceRole === 'customer_display') {
    return <CustomerFacingDisplayView onBackToMain={() => {
      setDedicatedDeviceRole(null);
      try { localStorage.removeItem('kian_dedicated_device_role'); } catch {}
    }} />;
  }
  if (dedicatedDeviceRole === 'waiter_mobile') {
    return <MobileWaiterView onBackToMain={() => {
      setDedicatedDeviceRole(null);
      try { localStorage.removeItem('kian_dedicated_device_role'); } catch {}
    }} />;
  }
  if (dedicatedDeviceRole === 'stock_scanner') {
    return <MobileStockScannerView onBackToMain={() => {
      setDedicatedDeviceRole(null);
      try { localStorage.removeItem('kian_dedicated_device_role'); } catch {}
    }} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'pos':
        return <POSView />;
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductsView />;
      case 'trade':
        return <TradeView />;
      case 'ai':
        return <AIAssistantView />;
      case 'inventory':
        return <InventoryView />;
      case 'customers':
        return <CustomersView />;
      case 'debts':
        return <DebtView />;
      case 'invoices':
        return <InvoicesView />;
      case 'returns':
        return <ReturnsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'reports':
        return <ReportsView />;
      case 'staff':
        return <StaffView />;
      case 'devices':
        return <DevicesHubView />;
      case 'settings':
        return <SettingsView />;
      case 'about':
        return <AboutView />;
      default:
        return <POSView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 select-none">
      {/* Sidebar for Desktop / Tablet */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="app-content-wrapper flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Top App Header */}
        <Header />

        {/* Dynamic View Body */}
        <main className="app-main-viewport flex-1 flex overflow-hidden relative">
          {renderActiveView()}
        </main>

        {/* Bottom Navigation for Mobile */}
        <BottomNav />
      </div>

      {/* Global Modals */}
      <PinSwitchModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
      />

      <GlobalSearchModal />

      <ModeSelectionModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
      />

      <DeviceDataTransferModal
        isOpen={isDataTransferModalOpen}
        onClose={() => setIsDataTransferModalOpen(false)}
      />

      <ConnectToCashierModal
        isOpen={isConnectToCashierModalOpen}
        onClose={() => setIsConnectToCashierModalOpen(false)}
      />

      {/* Floating Offline Sync & Storage Status Banner */}
      {(!isOnline || offlineQueueCount > 0) && (
        <aside
          aria-label="حالة الاتصال والمزامنة"
          className="fixed bottom-18 md:bottom-5 start-4 z-40 flex flex-wrap items-center gap-2.5 py-2 px-3 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md shadow-2xl border border-slate-700/80 text-xs animate-in slide-in-from-bottom-3 duration-300"
        >
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            )}
            <div>
              <div className="font-bold flex items-center gap-1.5 leading-tight">
                {!isOnline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    <span>وضع أوفلاين (IndexedDB)</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>متصل — مزامنة مضغوطة</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Embedded Data-Usage Summary Widget */}
          <DataUsageSummaryWidget
            onOpenDataTransfer={() => setIsDataTransferModalOpen(true)}
          />

          <div className="flex items-center gap-1.5 border-s border-slate-700 ps-2">
            {isOnline && (
              <button
                type="button"
                onClick={syncOfflineQueueNow}
                disabled={isSyncingOffline}
                className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                title="مزامنة العمليات المعلقة الآن بحزمة مضغوطة"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOffline ? 'animate-spin' : ''}`} />
                <span>{isSyncingOffline ? 'جارِ...' : 'مزامنة'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsDataTransferModalOpen(true)}
              className="flex items-center gap-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="نقل البيانات إلى جهاز آخر عبر كود الربط"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">نقل</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
