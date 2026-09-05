import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Category, DiningType } from '../../types';
import { soundEffects } from '../../services/audio';
import {
  Search,
  ScanBarcode,
  QrCode,
  Star,
  Plus,
  Minus,
  Trash2,
  Tag,
  UserCheck,
  UserX,
  CreditCard,
  Banknote,
  Percent,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  Building2,
  Store,
  Layers,
  UtensilsCrossed,
  Printer,
  Users,
  MessageSquarePlus,
  SlidersHorizontal,
  Coffee,
  Check,
  ChevronDown,
  Package,
  Boxes,
  Zap,
  DollarSign,
  Calculator,
  Coins,
  CheckCircle2
} from 'lucide-react';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { CustomerQRScannerModal } from './CustomerQRScannerModal';
import { PaymentModal } from './PaymentModal';
import { KitchenTicketModal } from './KitchenTicketModal';
import { RestaurantPOSHeader } from './RestaurantPOSHeader';
import { WholesalePOSHeader } from './WholesalePOSHeader';
import { RetailPOSHeader } from './RetailPOSHeader';

export const POSView: React.FC = () => {
  const {
    products,
    categories,
    cart,
    addToCart,
    updateCartItemQuantity,
    updateCartItemDiscount,
    removeFromCart,
    clearCart,
    selectedCustomer,
    setSelectedCustomer,
    orderDiscount,
    setOrderDiscount,
    pointsToRedeem,
    setPointsToRedeem,
    formatCurrency,
    settings,
    t,
    language,
    setActiveTab,
    posTradeMode,
    setPosTradeMode,
    businessMode,
    setIsModeModalOpen,
    restaurantDiningType,
    setRestaurantDiningType,
    selectedTable,
    setSelectedTable,
    guestCount,
    setGuestCount,
    updateCartItemKitchenNotes,
    toggleCartItemTradeMode,
    processSale,
    notify,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('cat_all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [lastScannedBanner, setLastScannedBanner] = useState<{
    product: Product;
    code: string;
    count: number;
  } | null>(null);

  // Modals & Popups
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isCustomerQRModalOpen, setIsCustomerQRModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isKitchenTicketModalOpen, setIsKitchenTicketModalOpen] = useState(false);

  // Interactive Cashier Change Calculator State
  const [posCashPaidInput, setPosCashPaidInput] = useState<string>('');
  const [isCashCalcOpen, setIsCashCalcOpen] = useState<boolean>(true);

  // Auto-focus search input immediately upon opening Cashier page
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Global hardware barcode scanner reader (USB / Bluetooth / Wireless gun)
  useEffect(() => {
    let scanBuffer = '';
    let lastKeyTime = 0;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when modal windows are open or in textarea
      const target = e.target as HTMLElement | null;
      const isEditingTextarea = target && target.tagName === 'TEXTAREA';
      const isModalOpen = isBarcodeModalOpen || isCustomerQRModalOpen || isPaymentModalOpen || isKitchenTicketModalOpen;
      if (isModalOpen || isEditingTextarea) return;

      const currentTime = Date.now();
      const isFast = (currentTime - lastKeyTime) < 80;
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        const candidate = (scanBuffer.trim() || searchQuery.trim());
        if (candidate.length >= 2) {
          const clean = candidate.toLowerCase();
          const found = products.find(p =>
            p.barcode.toLowerCase() === clean ||
            p.sku.toLowerCase() === clean ||
            p.identificationCodes?.some(c => c.toLowerCase() === clean)
          );

          if (found) {
            e.preventDefault();
            addToCart(found);
            soundEffects.playBeep();
            setLastScannedBanner(prev => ({
              product: found,
              code: candidate,
              count: prev?.product.id === found.id ? prev.count + 1 : 1
            }));
            setSearchQuery('');
            scanBuffer = '';
            // keep focus on search
            searchInputRef.current?.focus();
            return;
          }
        }
        scanBuffer = '';
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (isFast || scanBuffer.length > 0) {
          scanBuffer += e.key;
        } else {
          scanBuffer = e.key;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [products, searchQuery, isBarcodeModalOpen, isCustomerQRModalOpen, isPaymentModalOpen, isKitchenTicketModalOpen]);

  // Auto-dismiss scanned alert banner
  useEffect(() => {
    if (lastScannedBanner) {
      const timer = setTimeout(() => {
        setLastScannedBanner(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [lastScannedBanner]);

  // Item Note Inline Editing
  const [editingNoteItemKey, setEditingNoteItemKey] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

  // Table options for restaurant mode
  const tablesList = [
    'طاولة 1', 'طاولة 2', 'طاولة 3', 'طاولة 4', 'طاولة 5', 
    'طاولة 6', 'طاولة 7', 'طاولة 8', 'VIP 1', 'VIP 2', 'شرفة خارجية'
  ];

  // Quick preset kitchen notes
  const quickChefNotes = language === 'ar'
    ? ['بدون بصل', 'شطة زيادة', 'سكر خفيف', 'مستوي جيداً', 'صوص خارجي', 'بدون ثوم', 'سفري معلب']
    : ['No Onions', 'Extra Spicy', 'Less Sugar', 'Well Done', 'Sauce on Side', 'No Garlic', 'Packed To-Go'];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.status === 'inactive') return false;
      if (showFavoritesOnly && !p.isFavorite) return false;
      if (selectedCategory !== 'cat_all' && p.categoryId !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.nameAr.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q);
        const matchBarcode = p.barcode.includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchIdentification = p.identificationCodes?.some(c => c.toLowerCase().includes(q));
        return matchName || matchBarcode || matchSku || matchIdentification;
      }
      return true;
    });
  }, [products, selectedCategory, showFavoritesOnly, searchQuery]);

  // Handle direct Enter on search input (e.g. from physical barcode scanner)
  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = searchQuery.trim().toLowerCase();
      if (!q) return;
      const exactMatch = products.find(
        p =>
          p.barcode.toLowerCase() === q ||
          p.sku.toLowerCase() === q ||
          p.identificationCodes?.some(c => c.toLowerCase() === q)
      );
      if (exactMatch) {
        addToCart(exactMatch);
        soundEffects.playBeep();
        setLastScannedBanner(prev => ({
          product: exactMatch,
          code: searchQuery.trim(),
          count: prev?.product.id === exactMatch.id ? prev.count + 1 : 1
        }));
        setSearchQuery('');
        return;
      }
      if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        soundEffects.playBeep();
        setLastScannedBanner(prev => ({
          product: filteredProducts[0],
          code: searchQuery.trim(),
          count: prev?.product.id === filteredProducts[0].id ? prev.count + 1 : 1
        }));
        setSearchQuery('');
      }
    }
  };

  // Cart Calculations
  const subtotal = cart.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);
  const itemDiscountsTotal = cart.reduce((sum, it) => sum + ((it.unitPrice * it.quantity) - it.total), 0);

  // Estimated Wholesale savings
  const wholesaleSavings = cart.reduce((sum, it) => {
    if (it.isWholesale || posTradeMode === 'wholesale') {
      const retailPrice = it.product.price;
      const savingPerUnit = Math.max(0, retailPrice - it.unitPrice);
      return sum + (savingPerUnit * it.quantity);
    }
    return sum;
  }, 0);

  let orderDiscountAmount = 0;
  if (orderDiscount.value > 0) {
    orderDiscountAmount = orderDiscount.type === 'percentage'
      ? ((subtotal - itemDiscountsTotal) * orderDiscount.value) / 100
      : orderDiscount.value;
  }

  // Loyalty points discount calculation (e.g. 1 point = 100 SYP)
  const pointsDiscountAmount = selectedCustomer && pointsToRedeem > 0
    ? pointsToRedeem * (settings.pointsRedeemRatio || 100)
    : 0;

  const totalDiscount = itemDiscountsTotal + orderDiscountAmount + pointsDiscountAmount;
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const taxAmount = settings.enableTax ? (taxableAmount * (settings.defaultTaxRate || 0)) / 100 : 0;
  const grandTotal = Math.round(taxableAmount + taxAmount);

  // Total items in cart
  const cartItemsCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  const startEditingNote = (productId: string, currentNote?: string) => {
    setEditingNoteItemKey(productId);
    setTempNoteText(currentNote || '');
  };

  const saveItemNote = (productId: string) => {
    updateCartItemKitchenNotes(productId, tempNoteText.trim());
    setEditingNoteItemKey(null);
  };

  // Quick add full carton/pack helper for wholesale
  const handleAddCarton = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const multiplier = product.wholesaleUnitMultiplier || 6;
    addToCart(product, multiplier, true);
  };

  // Quick add multiple packs
  const handleAddMultiplePacks = (product: Product, packsCount: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const multiplier = product.wholesaleUnitMultiplier || 6;
    addToCart(product, packsCount * multiplier, true);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-100/70 dark:bg-slate-950">
      {/* LEFT / CENTER: Products Catalog & Categories */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-4 space-y-3">
        
        {/* MODE-SPECIALIZED HEADER BANNER */}
        {businessMode === 'restaurant' && (
          <RestaurantPOSHeader onOpenKitchenTicket={() => setIsKitchenTicketModalOpen(true)} />
        )}
        {businessMode === 'wholesale' && (
          <WholesalePOSHeader />
        )}
        {businessMode === 'retail' && (
          <RetailPOSHeader
            onScanBarcode={() => setIsBarcodeModalOpen(true)}
            onScanCustomerQR={() => setIsCustomerQRModalOpen(true)}
          />
        )}

        {/* Top Active Mode Bar & Quick Switcher */}
        <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                businessMode === 'restaurant' ? 'bg-emerald-400' : businessMode === 'wholesale' ? 'bg-amber-400' : 'bg-blue-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                businessMode === 'restaurant' ? 'bg-emerald-500' : businessMode === 'wholesale' ? 'bg-amber-500' : 'bg-blue-500'
              }`}></span>
            </span>
            <div className="flex items-center gap-2">
              {businessMode === 'restaurant' && (
                <span className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'نمط المطاعم والكافيهات النشط' : 'Restaurant Mode Active'}</span>
                </span>
              )}
              {businessMode === 'wholesale' && (
                <span className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'نمط تجارة الجملة والتوزيع النشط' : 'Wholesale Mode Active'}</span>
                </span>
              )}
              {businessMode === 'retail' && (
                <span className="flex items-center gap-1.5 text-xs font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800">
                  <Store className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'نمط التجزئة والسوبرماركت النشط' : 'Retail Mode Active'}</span>
                </span>
              )}
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {language === 'ar' ? 'تخصيص الواجهة والأسعار تلقائياً' : 'Tailored UI & Pricing'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Wholesale Trade Mode Toggle if in Wholesale Mode */}
            {businessMode === 'wholesale' && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setPosTradeMode('wholesale')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    posTradeMode === 'wholesale'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {language === 'ar' ? 'سعر الجملة' : 'Wholesale Price'}
                </button>
                <button
                  type="button"
                  onClick={() => setPosTradeMode('retail')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    posTradeMode === 'retail'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {language === 'ar' ? 'سعر المفرق' : 'Retail Price'}
                </button>
              </div>
            )}

            <button
              id="btn-switch-business-mode-pos"
              onClick={() => setIsModeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              title={language === 'ar' ? 'تبديل نمط الكاشير' : 'Switch Mode'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'ar' ? 'تبديل النمط' : 'Switch Mode'}</span>
            </button>
          </div>
        </div>

        {/* Live Barcode Scanned Floating Alert */}
        {lastScannedBanner && (
          <div className="flex items-center justify-between p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs font-black text-emerald-800 dark:text-emerald-200">
                  ⚡ تم مسح الباركود بنجاح وإضافته للسلة
                </p>
                <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  {language === 'ar' ? lastScannedBanner.product.nameAr : lastScannedBanner.product.nameEn} ({formatCurrency(lastScannedBanner.product.price)}) - الكود: {lastScannedBanner.code}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-emerald-600 text-white px-2.5 py-1 rounded-xl shadow-xs">
                +{lastScannedBanner.count} بالسلة
              </span>
              <button
                onClick={() => setLastScannedBanner(null)}
                className="text-xs text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 p-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Search & Direct Controls Bar */}
        <div className="flex items-center gap-2">
          {/* Search Input with Auto-Focus and Hardware Barcode Readiness */}
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              id="pos-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchInputKeyDown}
              placeholder={businessMode === 'restaurant' 
                ? (language === 'ar' ? 'بحث عن وجبة، مشروب، حلى، أو امسح الباركود مباشرة...' : 'Search meal, drink, or scan barcode...')
                : businessMode === 'wholesale'
                ? (language === 'ar' ? 'بحث عن بضاعة، كود تعريفي، باركود، أو امسح فوراً...' : 'Search item, identification code, or scan...')
                : (language === 'ar' ? 'امسح الباركود فوراً أو ابحث عن منتج، كود SKU...' : 'Scan barcode directly or search product...')
              }
              className="w-full pl-3 pr-9 py-2.5 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs focus:outline-none focus:border-amber-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 absolute end-3 top-3 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Barcode Scanner Button (Camera / Modal) */}
          <button
            id="btn-scan-barcode-modal"
            onClick={() => setIsBarcodeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs active:scale-95 transition-all shrink-0"
            title={language === 'ar' ? 'قارئ الباركود والكاميرا' : 'Barcode & Camera Scanner'}
          >
            <ScanBarcode className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">{t('scanBarcode')}</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="القارئ نشط تلقائياً" />
          </button>

          {/* Customer QR Scanner Button */}
          <button
            id="btn-scan-customer-qr-modal"
            onClick={() => setIsCustomerQRModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-2xl border shadow-xs active:scale-95 transition-all ${
              selectedCustomer
                ? 'bg-amber-500 text-white border-amber-500 shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title={t('scanCustomerQR')}
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">
              {selectedCustomer ? selectedCustomer.name : t('customer')}
            </span>
          </button>

          {/* Mobile Cart Toggle Button */}
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className={`lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 text-white font-bold text-xs rounded-2xl shadow-md shrink-0 ${
              businessMode === 'restaurant'
                ? 'bg-emerald-600 shadow-emerald-600/20'
                : businessMode === 'wholesale'
                ? 'bg-amber-600 shadow-amber-600/20'
                : 'bg-blue-600 shadow-blue-600/20'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{cartItemsCount}</span>
          </button>
        </div>

        {/* Categories Horizontal Scrolling Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
          <button
            onClick={() => {
              setSelectedCategory('cat_all');
              setShowFavoritesOnly(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'cat_all' && !showFavoritesOnly
                ? businessMode === 'restaurant'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : businessMode === 'wholesale'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {t('allCategories')}
          </button>

          {/* Favorites Filter */}
          <button
            onClick={() => {
              setShowFavoritesOnly(!showFavoritesOnly);
              setSelectedCategory('cat_all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              showFavoritesOnly
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white' : 'text-amber-500'}`} />
            <span>{businessMode === 'restaurant' ? (language === 'ar' ? 'الأكثر طلباً' : 'Popular Dishes') : t('favorites')}</span>
          </button>

          {categories.filter(c => c.id !== 'cat_all').map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setShowFavoritesOnly(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id && !showFavoritesOnly
                  ? businessMode === 'restaurant'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : businessMode === 'wholesale'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {language === 'ar' ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Products Display Area - Mode Tailored */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('noProductsFound')}</p>
              <button
                onClick={() => setActiveTab('products')}
                className="mt-3 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                + {t('addProduct')}
              </button>
            </div>
          ) : businessMode === 'restaurant' ? (
            /* 1. RESTAURANT & CAFE MODE: Visual Food Photo Cards Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5 pb-6">
              {filteredProducts.map(product => {
                const inCart = cart.find(it => it.productId === product.id);
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock <= product.minStock && !isOutOfStock;

                return (
                  <div
                    key={product.id}
                    id={`pos-product-card-${product.id}`}
                    onClick={() => addToCart(product)}
                    className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 border transition-all cursor-pointer flex flex-col justify-between select-none shadow-xs hover:shadow-md hover:scale-[1.01] border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 ${
                      inCart
                        ? 'ring-2 ring-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : ''
                    }`}
                  >
                    {/* Top Image & Badges */}
                    <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.nameAr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-2xl bg-emerald-50 dark:bg-emerald-950/30">
                          {product.nameAr.charAt(0)}
                        </div>
                      )}

                      {/* Stock Badge */}
                      <span
                        className={`absolute top-1.5 start-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-md backdrop-blur-xs ${
                          isOutOfStock
                            ? 'bg-rose-500/90 text-white'
                            : isLowStock
                            ? 'bg-amber-500/90 text-white'
                            : 'bg-black/60 text-white'
                        }`}
                      >
                        {isOutOfStock ? t('outOfStock') : `${product.stock} ${product.unit}`}
                      </span>

                      {/* Restaurant Freshness Tag */}
                      <span className="absolute top-1.5 end-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-700/90 text-white shadow-xs flex items-center gap-0.5">
                        <span>👨‍🍳</span>
                        <span>{language === 'ar' ? 'طازج' : 'Fresh'}</span>
                      </span>

                      {/* In Cart Indicator Badge */}
                      {inCart && (
                        <span className="absolute bottom-1.5 end-1.5 w-6 h-6 text-white text-xs font-black rounded-full flex items-center justify-center shadow-md animate-in zoom-in bg-emerald-600">
                          {inCart.quantity}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                        {language === 'ar' ? product.nameAr : product.nameEn}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {product.sku}
                      </p>
                    </div>

                    {/* Restaurant Card Bottom */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 block font-mono">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {product.unit || 'وجبة / طلب'}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : businessMode === 'wholesale' ? (
            /* 2. WHOLESALE & DISTRIBUTION MODE: High-Density Trade Order Sheet (No Images) */
            <div className="space-y-2 pb-6">
              {/* Wholesale Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <div className="col-span-4">{language === 'ar' ? 'الصنف والباركود / SKU' : 'Item & Barcode'}</div>
                <div className="col-span-2 text-center">{language === 'ar' ? 'المخزون والكراتين' : 'Stock & Cartons'}</div>
                <div className="col-span-2 text-center">{language === 'ar' ? 'سعر الجملة للكرتونة' : 'Wholesale / Pack'}</div>
                <div className="col-span-3 text-center">{language === 'ar' ? 'إضافة سريعة للطلبية' : 'Quick Add Bulk'}</div>
                <div className="col-span-1 text-end">{language === 'ar' ? 'بالسلة' : 'In Cart'}</div>
              </div>

              {filteredProducts.map(product => {
                const inCart = cart.find(it => it.productId === product.id);
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock <= product.minStock && !isOutOfStock;
                const multiplier = product.wholesaleUnitMultiplier || 6;
                const wholesalePrice = product.wholesalePrice || Math.round(product.price * 0.8);
                const wholesalePackPrice = wholesalePrice * multiplier;
                const retailPackPrice = product.price * multiplier;
                const packSaving = Math.max(0, retailPackPrice - wholesalePackPrice);
                const cartonsAvailable = Math.floor(product.stock / multiplier);

                return (
                  <div
                    key={product.id}
                    id={`pos-wholesale-row-${product.id}`}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-3 sm:px-4 sm:py-2.5 border transition-all shadow-2xs hover:shadow-xs hover:border-amber-400 ${
                      inCart
                        ? 'border-amber-400 dark:border-amber-600 bg-amber-50/25 dark:bg-amber-950/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center">
                      {/* Item Details (Col 4) */}
                      <div className="sm:col-span-4 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {language === 'ar' ? product.nameAr : product.nameEn}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span>{product.sku}</span>
                            {product.barcode && <span>• {product.barcode}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Stock & Cartons Available (Col 2) */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
                        <div className="text-center sm:text-center">
                          <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {product.stock} {product.unit}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            ({cartonsAvailable} {product.wholesaleUnit || 'كرتونة'})
                          </span>
                        </div>
                      </div>

                      {/* Wholesale Price Info (Col 2) */}
                      <div className="sm:col-span-2 text-start sm:text-center">
                        <div className="flex sm:flex-col items-baseline sm:items-center justify-between sm:justify-center gap-1">
                          <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                            {formatCurrency(wholesalePackPrice)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatCurrency(wholesalePrice)} / قطعة
                          </span>
                          {packSaving > 0 && (
                            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded">
                              وفر {formatCurrency(packSaving)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Bulk Add Actions (Col 3) */}
                      <div className="sm:col-span-3 flex items-center justify-end sm:justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, 1, false);
                          }}
                          className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95"
                          title="إضافة قطعة واحدة"
                        >
                          +1 {product.unit || 'قطعة'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleAddCarton(product, e)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all active:scale-95 shadow-xs flex items-center gap-1"
                          title={`إضافة كرتونة (${multiplier} قطع)`}
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          <span>+1 {product.wholesaleUnit || 'كرتونة'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleAddMultiplePacks(product, 5, e)}
                          className="px-2 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs font-black transition-all active:scale-95 font-mono"
                          title="إضافة 5 كراتين"
                        >
                          +5
                        </button>
                      </div>

                      {/* In Cart Indicator (Col 1) */}
                      <div className="sm:col-span-1 flex items-center justify-end">
                        {inCart ? (
                          <div className="flex items-center gap-1 bg-amber-500 text-white px-2.5 py-1 rounded-xl text-xs font-black font-mono shadow-xs">
                            <span>{inCart.quantity}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 dark:text-slate-700 hidden sm:inline">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 3. RETAIL & SUPERMARKET MODE: Ultra-Fast Scanner List (No Images) */
            <div className="space-y-1.5 pb-6">
              {/* Retail Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <div className="col-span-5">{language === 'ar' ? 'الصنف وكود الباركود' : 'Product & Barcode'}</div>
                <div className="col-span-2 text-center">{language === 'ar' ? 'المخزون الحالي' : 'Stock'}</div>
                <div className="col-span-2 text-center">{language === 'ar' ? 'السعر الفردي' : 'Unit Price'}</div>
                <div className="col-span-2 text-center">{language === 'ar' ? 'إضافة للسلة' : 'Add'}</div>
                <div className="col-span-1 text-end">{language === 'ar' ? 'بالسلة' : 'In Cart'}</div>
              </div>

              {filteredProducts.map(product => {
                const inCart = cart.find(it => it.productId === product.id);
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock <= product.minStock && !isOutOfStock;

                return (
                  <div
                    key={product.id}
                    id={`pos-retail-row-${product.id}`}
                    onClick={() => addToCart(product)}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:px-4 sm:py-2 border transition-all cursor-pointer select-none shadow-2xs hover:shadow-xs hover:border-blue-400 flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center ${
                      inCart
                        ? 'border-blue-400 dark:border-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Item Name & Barcode (Col 5) */}
                    <div className="sm:col-span-5 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {language === 'ar' ? product.nameAr : product.nameEn}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>{product.barcode || product.sku}</span>
                          <span className="text-slate-300">•</span>
                          <span>{product.sku}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Status (Col 2) */}
                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {isOutOfStock ? t('outOfStock') : `${product.stock} ${product.unit}`}
                      </span>
                    </div>

                    {/* Price (Col 2) */}
                    <div className="sm:col-span-2 text-start sm:text-center">
                      <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    {/* Add Button (Col 2) */}
                    <div className="sm:col-span-2 flex items-center justify-end sm:justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'إضافة' : 'Add'}</span>
                      </button>
                    </div>

                    {/* In Cart (Col 1) */}
                    <div className="sm:col-span-1 flex items-center justify-end">
                      {inCart ? (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                          {inCart.quantity}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-700 hidden sm:inline">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: POS Register Cart & Checkout Panel */}
      <div
        className={`w-full lg:w-96 xl:w-[420px] bg-white dark:bg-slate-900 border-s border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-lg z-30 transition-transform ${
          isMobileCartOpen ? 'fixed inset-0 z-50' : 'hidden lg:flex'
        }`}
      >
        {/* Cart Header with Mode Badge */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className={`w-5 h-5 ${
              businessMode === 'restaurant' ? 'text-emerald-600' : businessMode === 'wholesale' ? 'text-amber-500' : 'text-blue-600'
            }`} />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {businessMode === 'restaurant' ? (language === 'ar' ? 'طلب الطاولة والتجهيز' : 'Table Order') : businessMode === 'wholesale' ? (language === 'ar' ? 'فاتورة إرسالية الجملة' : 'Wholesale Invoice') : t('currentOrder')}
            </h3>
            {cartItemsCount > 0 && (
              <span className={`text-[10px] text-white font-bold px-2 py-0.5 rounded-full ${
                businessMode === 'restaurant' ? 'bg-emerald-600' : businessMode === 'wholesale' ? 'bg-amber-500 text-slate-950' : 'bg-blue-600'
              }`}>
                {cartItemsCount} {t('itemsCount')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className="p-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-indigo-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 transition-all flex items-center gap-1 text-[11px] font-bold"
              title={language === 'ar' ? 'المستشار الذكي (Gemini AI)' : 'AI Smart Advisor'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">{language === 'ar' ? 'اقتراحات AI' : 'AI Advisor'}</span>
            </button>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title={t('clearCart')}
              >
                {t('clearCart')}
              </button>
            )}
            {/* Close for mobile drawer */}
            <button
              onClick={() => setIsMobileCartOpen(false)}
              className="lg:hidden p-1.5 rounded-full text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* RESTAURANT MODE: Dining Type & Table Bar */}
        {businessMode === 'restaurant' && (
          <div className="p-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                {restaurantDiningType === 'dine_in' ? `🍽️ ${selectedTable} (${guestCount} ضيوف)` : restaurantDiningType === 'takeaway' ? '🥡 طلب سفري' : '🛵 توصيل دليفري'}
              </span>
            </div>
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setIsKitchenTicketModalOpen(true)}
              className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 transition-all"
            >
              <Printer className="w-3 h-3" />
              <span>{language === 'ar' ? 'معاينة بون المطبخ' : 'Preview KOT'}</span>
            </button>
          </div>
        )}

        {/* WHOLESALE MODE: Active Merchant / Debt Profile Card */}
        {businessMode === 'wholesale' && selectedCustomer && (
          <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-amber-900 dark:text-amber-200 truncate max-w-[190px]">
                {selectedCustomer.companyName || selectedCustomer.name}
              </div>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold font-mono">
                {language === 'ar' ? 'الذمة الحالية:' : 'Debt:'} {formatCurrency(selectedCustomer.currentDebt || 0)}
              </span>
            </div>
            <span className="text-[10px] bg-amber-200/90 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold px-2 py-0.5 rounded-md">
              {language === 'ar' ? 'سعر جملة تجار' : 'Wholesale Tier'}
            </span>
          </div>
        )}

        {/* RETAIL MODE: Customer Loyalty Banner */}
        {businessMode === 'retail' && selectedCustomer && (
          <div className="p-2.5 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {settings.enableLoyaltyPoints !== false ? (
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              )}
              <span className="font-bold text-blue-900 dark:text-blue-200">{selectedCustomer.name}</span>
            </div>
            {settings.enableLoyaltyPoints !== false ? (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                {selectedCustomer.points} نقطة
              </span>
            ) : (
              <span className={`text-[10px] font-bold font-mono ${
                (selectedCustomer.currentDebt || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {(selectedCustomer.currentDebt || 0) > 0 ? `ذمة: ${formatCurrency(selectedCustomer.currentDebt || 0)}` : 'مبرأ الذمة'}
              </span>
            )}
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-14 h-14 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('emptyCart')}</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">{t('emptyCartSubtitle')}</p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.productId}
                className={`p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex flex-col gap-2 shadow-2xs ${
                  item.isWholesale ? 'border-amber-300/80 dark:border-amber-800/80' : 'border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                      </h4>
                      {item.wholesaleUnit && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 shrink-0">
                          {item.wholesaleUnit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      <span>{formatCurrency(item.unitPrice)}</span>
                      {item.discount > 0 && (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          (خصم {formatCurrency(item.discount)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                    <button
                      onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center active:scale-95"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <span className="w-6 text-center text-xs font-black font-mono text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                      className={`w-6 h-6 rounded-lg text-white flex items-center justify-center active:scale-95 ${
                        businessMode === 'restaurant'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : businessMode === 'wholesale'
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Item Total & Trash */}
                  <div className="text-end shrink-0 min-w-[65px]">
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono block">
                      {formatCurrency(item.total)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors mt-0.5"
                      title="حذف الصنف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Wholesale Mode: Rapid Carton Multiplier & Trade Mode Switch */}
                {businessMode === 'wholesale' && (
                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                    <button
                      type="button"
                      onClick={() => toggleCartItemTradeMode(item.productId)}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                        item.isWholesale
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.isWholesale ? '📦 تسعير طرد / جملة' : '🏷️ تسعير مفرق'}
                    </button>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">إضافة سريعة:</span>
                      {[5, 10].map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => updateCartItemQuantity(item.productId, item.quantity + cnt)}
                          className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-amber-100 text-slate-800 dark:text-slate-200 font-mono font-bold"
                        >
                          +{cnt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Restaurant Mode: Item Kitchen Notes */}
                {businessMode === 'restaurant' && (
                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                    {editingNoteItemKey === item.productId ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={tempNoteText}
                            onChange={e => setTempNoteText(e.target.value)}
                            placeholder={language === 'ar' ? 'ملاحظة المطبخ (مثلاً: بدون بصل)...' : 'Kitchen note...'}
                            className="flex-1 px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => saveItemNote(item.productId)}
                            className="px-2 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Quick tags */}
                        <div className="flex flex-wrap gap-1">
                          {quickChefNotes.map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setTempNoteText(n)}
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-800"
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px]">
                        {item.kitchenNotes ? (
                          <div 
                            onClick={() => startEditingNote(item.productId, item.kitchenNotes)}
                            className="text-emerald-700 dark:text-emerald-400 font-semibold cursor-pointer hover:underline flex items-center gap-1"
                          >
                            <span>📝</span>
                            <span className="truncate max-w-[220px]">{item.kitchenNotes}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditingNote(item.productId)}
                            className="text-slate-400 hover:text-emerald-600 text-[10px] font-semibold flex items-center gap-1"
                          >
                            <MessageSquarePlus className="w-3 h-3" />
                            <span>+ {language === 'ar' ? 'ملاحظة للشيف' : 'Chef Note'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Cart Bottom Summary & Checkout */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
          {/* Order Discount Option */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('orderDiscount')}:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                placeholder="0"
                value={orderDiscount.value || ''}
                onChange={e => setOrderDiscount({ ...orderDiscount, value: Number(e.target.value) })}
                className="w-16 text-center text-xs font-bold py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700"
              />
              <button
                onClick={() => setOrderDiscount({ ...orderDiscount, type: orderDiscount.type === 'percentage' ? 'fixed' : 'percentage' })}
                className="px-1.5 py-1 text-[10px] font-bold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
              >
                {orderDiscount.type === 'percentage' ? '%' : settings.currency.symbol}
              </button>
            </div>
          </div>

          {/* Subtotal & Totals breakdown */}
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
            <div className="flex justify-between">
              <span>{t('subtotal')}</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>

            {/* Wholesale Savings Callout */}
            {wholesaleSavings > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                <span>{language === 'ar' ? 'توفير أسعار الجملة:' : 'Wholesale Savings:'}</span>
                <span className="font-mono">-{formatCurrency(wholesaleSavings)}</span>
              </div>
            )}

            {totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>{t('totalDiscounts')}</span>
                <span className="font-mono">-{formatCurrency(totalDiscount)}</span>
              </div>
            )}

            {settings.enableTax && (
              <div className="flex justify-between">
                <span>{t('tax')} ({settings.defaultTaxRate}%)</span>
                <span className="font-mono">+{formatCurrency(taxAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-black text-slate-950 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
              <span>{t('grandTotal')}</span>
              <span className={`font-mono text-lg ${
                businessMode === 'restaurant'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : businessMode === 'wholesale'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}>
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Restaurant Quick KOT Kitchen Print Button + Main Pay Button */}
          <div className="flex items-center gap-2 pt-1">
            {businessMode === 'restaurant' && (
              <button
                type="button"
                id="btn-print-kot-kitchen"
                disabled={cart.length === 0}
                onClick={() => setIsKitchenTicketModalOpen(true)}
                className={`py-3 px-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 border transition-all active:scale-95 ${
                  cart.length === 0
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 shadow-xs'
                }`}
                title="إرسال وطباعة بون تحضير المطبخ KOT"
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                <span className="whitespace-nowrap">{t('sendToKitchen')}</span>
              </button>
            )}

            {/* Pay Now Button */}
            <button
              type="button"
              id="btn-pos-pay-now"
              disabled={cart.length === 0}
              onClick={() => setIsPaymentModalOpen(true)}
              className={`flex-1 py-3.5 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
                cart.length === 0
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'
                  : businessMode === 'restaurant'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-600/30'
                  : businessMode === 'wholesale'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-amber-600/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-600/30'
              }`}
            >
              <Banknote className="w-5 h-5" />
              <span>{t('payNow')} ({formatCurrency(grandTotal)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onProductNotFound={(barcode) => {
          setActiveTab('products');
        }}
      />

      <CustomerQRScannerModal
        isOpen={isCustomerQRModalOpen}
        onClose={() => setIsCustomerQRModalOpen(false)}
        onSelectCustomer={(cust) => {
          setSelectedCustomer(cust);
        }}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={grandTotal}
      />

      {businessMode === 'restaurant' && (
        <KitchenTicketModal
          isOpen={isKitchenTicketModalOpen}
          onClose={() => setIsKitchenTicketModalOpen(false)}
        />
      )}
    </div>
  );
};
