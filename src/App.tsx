import React from 'react';
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
import { PinSwitchModal } from './components/modals/PinSwitchModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { ModeSelectionModal } from './components/modals/ModeSelectionModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    isPinModalOpen, 
    setIsPinModalOpen, 
    isSearchModalOpen, 
    setIsSearchModalOpen,
    isModeModalOpen,
    setIsModeModalOpen
  } = useApp();

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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 select-none">
      {/* Sidebar for Desktop / Tablet */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Top App Header */}
        <Header />

        {/* Dynamic View Body */}
        <main className="flex-1 flex overflow-hidden relative">
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
