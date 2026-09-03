export type BusinessMode = 'restaurant' | 'wholesale' | 'retail';
export type DiningType = 'dine_in' | 'takeaway' | 'delivery';

export type UserRole = 'owner' | 'admin' | 'manager' | 'cashier' | 'inventory' | 'accountant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  pinCode: string;
  active: boolean;
  phone?: string;
  branchId?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  color?: string;
  sortOrder: number;
}

export type TradeType = 'retail' | 'wholesale' | 'both';

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  barcode: string;
  sku: string;
  categoryId: string;
  price: number; // Retail price (سعر المفرق / التجزئة)
  costPrice: number;
  wholesalePrice?: number; // Wholesale price (سعر الجملة للقطعة أو الوحدة)
  wholesaleMinQty?: number; // Minimum quantity to qualify for wholesale price (الحد الأدنى للجملة)
  wholesaleUnit?: string; // e.g. 'كرتونة', 'صندوق', 'دزينة', 'باقة', 'طرد'
  wholesaleUnitMultiplier?: number; // Number of single pieces inside wholesale unit (e.g. 12 or 24)
  tradeType?: TradeType; // 'retail' | 'wholesale' | 'both'
  stock: number;
  minStock: number;
  unit: string;
  image?: string;
  isFavorite: boolean;
  status: 'active' | 'inactive';
  taxRate?: number;
  discount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage or fixed
  discountType: 'percentage' | 'fixed';
  total: number;
  notes?: string;
  kitchenNotes?: string;
  isWholesale?: boolean; // Indicates if sold at wholesale rate
  wholesaleUnit?: string;
  wholesaleMultiplier?: number;
}

export interface Customer {
  id: string;
  customerCode: string; // e.g. CUS634567
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  totalSpent: number;
  visitCount: number;
  points: number;
  customerType?: 'retail' | 'wholesale'; // Type: Regular retail buyer or Wholesale merchant
  companyName?: string; // Shop or Business name for wholesale merchants
  commercialRecord?: string; // CR / Tax number
  commercialRegisterNo?: string;
  taxNumber?: string;
  paymentTerms?: string;
  creditLimit?: number; // Maximum debt limit
  currentDebt?: number; // Current unpaid balance
  lastPurchaseDate?: string;
  createdAt: string;
  qrData: string;
}

export interface PointsTransaction {
  id: string;
  customerId: string;
  customerName: string;
  saleId?: string;
  type: 'earn' | 'redeem' | 'adjust';
  points: number;
  amount: number;
  note: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productNameAr: string;
  productNameEn: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  total: number;
  kitchenNotes?: string;
  isWholesale?: boolean;
  wholesaleUnit?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'points' | 'credit' | 'split' | string;

export interface Sale {
  id: string;
  invoiceNumber: string;
  storeId: string;
  branchId: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  customerCode?: string;
  customerPhone?: string;
  businessMode?: BusinessMode;
  diningType?: DiningType;
  tableName?: string;
  guestCount?: number;
  tradeType?: 'retail' | 'wholesale' | 'mixed'; // Sale classification
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  costTotal: number;
  profitTotal: number;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  changeAmount: number;
  pointsEarned: number;
  pointsRedeemed: number;
  pointsDiscountAmount: number;
  status: 'completed' | 'refunded' | 'partially_refunded' | 'voided';
  notes?: string;
  createdAt: string;
}

export interface RefundItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Refund {
  id: string;
  refundNumber: string;
  originalSaleId: string;
  invoiceNumber: string;
  items: RefundItem[];
  totalRefundAmount: number;
  reason: string;
  restock: boolean;
  cashierId: string;
  cashierName: string;
  createdAt: string;
}

export type StockMovementType = 'sale' | 'purchase' | 'restock' | 'return' | 'adjustment' | 'damage' | 'vehicle_dispatch' | 'vehicle_return' | 'warehouse_transfer';

export type WholesaleWarehouseType = 'main_wholesale' | 'regional_hub' | 'distribution_hub' | 'buffer_depot' | 'cold_storage' | 'distribution_center';

export interface WholesaleWarehouse {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  type?: WholesaleWarehouseType;
  location: string;
  managerName: string;
  phone: string;
  managerPhone?: string;
  capacity?: string;
  capacityM3?: number;
  active: boolean;
  isMainWholesale: boolean;
  notes?: string;
  createdAt: string;
}

export type VehicleType = 'van' | 'refrigerated_van' | 'light_truck' | 'heavy_truck' | 'pickup';
export type VehicleStatus = 'available' | 'loading' | 'on_route' | 'returned_pending_audit' | 'returned_for_audit' | 'maintenance';

export interface DeliveryVehicle {
  id: string;
  plateNumber: string;
  modelName: string;
  vehicleType: VehicleType;
  driverName: string;
  driverPhone: string;
  driverCode: string;
  assignedWarehouseId: string;
  assignedWarehouseName: string;
  distributionRoute: string;
  maxPayloadKg: number;
  status: VehicleStatus;
  currentManifestId?: string;
  lastDispatchedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface VehicleManifestItem {
  productId: string;
  productNameAr: string;
  productNameEn: string;
  barcode: string;
  sku: string;
  wholesaleUnit: string;
  unitMultiplier: number;
  loadedPackages: number;
  totalUnitsLoaded: number;
  costPrice: number;
  wholesaleUnitPrice: number;
  totalWholesaleValue: number;
  soldUnits: number;
  returnedUnits: number;
  damagedUnits: number;
}

export interface VehicleLoadingManifest {
  id: string;
  manifestNumber: string; // e.g. TRK-2026-00421
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverName: string;
  driverPhone: string;
  warehouseId: string;
  warehouseName: string;
  dispatchOfficerId: string;
  dispatchOfficerName: string;
  routeArea: string;
  status: 'loaded' | 'dispatched' | 'reconciled' | 'cancelled';
  loadedAt: string;
  dispatchedAt?: string;
  returnedAt?: string;
  items: VehicleManifestItem[];
  totalPackagesLoaded: number;
  totalUnitsLoaded: number;
  totalCostValue: number;
  totalWholesaleValue: number;
  totalSoldValue?: number;
  cashCollected?: number;
  creditSalesAmount?: number;
  reconciliationNotes?: string;
  notes?: string;
}

export interface WarehouseStockTransfer {
  id: string;
  transferNumber: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  targetWarehouseId: string;
  targetWarehouseName: string;
  items: {
    productId: string;
    productNameAr: string;
    quantity: number;
    unit: string;
  }[];
  transferredBy: string;
  reason: string;
  createdAt: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export type ExpenseCategory = 'rent' | 'electricity' | 'utilities' | 'salaries' | 'purchases' | 'supplies' | 'transport' | 'maintenance' | 'marketing' | 'other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date?: string;
  notes?: string;
  recordedBy?: string;
  createdByName?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  previousData?: string;
  newData?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface CurrencyConfig {
  code: string;
  nameAr: string;
  nameEn: string;
  symbol: string;
  symbolNative: string;
  decimals: number;
}

export interface ExchangeRateBulletin {
  usdBuyRate: number; // e.g. 14800 Base Currency per 1 USD
  usdSellRate: number; // e.g. 14950 Base Currency per 1 USD
  eurBuyRate: number; // e.g. 16100 Base Currency per 1 EUR
  eurSellRate: number; // e.g. 16250 Base Currency per 1 EUR
  goldGram21?: number; // e.g. 1050000 Base Currency per 1g 21k Gold
  centralBankOfficialRate?: number; // e.g. 13500 Official rate
  lastUpdated: string;
  sourceLabel?: string;
  displayInHeader: boolean;
  displayInPosCart: boolean;
  displayInReceipts: boolean;
  preferredDisplay: 'USD' | 'EUR' | 'BOTH';
}

export interface GoogleDriveBackupFile {
  id: string;
  name: string;
  size: number;
  createdTime: string;
  modifiedTime?: string;
  description?: string;
  appVersion?: string;
  summary?: {
    productsCount: number;
    salesCount: number;
    customersCount: number;
    inventoryMovementsCount: number;
    backupDate: string;
  };
}

export type ThemeMode = 'light' | 'dark' | 'auto_time' | 'system';

export interface StoreSettings {
  storeId: string;
  storeNameAr: string;
  storeNameEn: string;
  tagline: string;
  logo: string;
  phone: string;
  mobile: string;
  email: string;
  address: string;
  taxNumber: string;
  commercialRecord: string;
  currency: CurrencyConfig;
  exchangeBulletin?: ExchangeRateBulletin;
  // Theme & Night Mode (Cashier Eye Comfort)
  themeMode?: ThemeMode;
  nightModeStartHour?: number; // e.g. 18 (6:00 PM)
  nightModeEndHour?: number; // e.g. 6 (6:00 AM)
  cashierEyeComfort?: boolean;
  enableTax: boolean;
  defaultTaxRate: number; // percentage
  enableDiscounts: boolean;
  enableLoyaltyPoints: boolean;
  pointsSpendRatio: number; // e.g., 10000 SYP = 1 Point
  pointsRedeemRatio: number; // e.g., 100 Points = 10000 SYP (100 SYP per point)
  receiptHeader: string;
  receiptFooter: string;
  printPaperSize: '80mm' | '58mm' | 'a4';
  autoPrintOnSale: boolean;
  soundEffects: boolean;
  lowStockThreshold: number;
  offlineSyncEnabled: boolean;
  managerWhatsappPhone?: string;
  autoSendDailyReportOnClose?: boolean;
  includeInventoryInReport?: boolean;
  googleDriveConnected?: boolean;
  googleDriveEmail?: string;
  googleDriveUserName?: string;
  googleDriveAutoBackup?: boolean;
  googleDriveBackupIntervalHours?: number;
  googleDriveLastBackupAt?: string;
  googleDriveLastBackupStatus?: 'success' | 'failed' | 'in_progress';
  // Automated WhatsApp Debt Collection & Reminder System
  autoSendDebtInvoiceWhatsApp?: boolean; // Send WhatsApp immediately when credit sale is issued
  autoSendDebtPaymentWhatsApp?: boolean; // Send WhatsApp receipt immediately when debt payment is received
  autoSendDebtReminders?: boolean; // Periodic background debt reminder
  debtReminderFrequency?: 'daily' | 'every_3_days' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  debtReminderDays?: number; // Days between reminders (e.g. 1, 3, 7, 14, 30 days)
  debtReminderPreferredHour?: number; // Preferred hour to dispatch reminders (0-23, e.g. 10 for 10:00 AM)
  debtReminderMinThreshold?: number; // Minimum debt amount to trigger reminders
  debtReminderGracePeriodDays?: number; // Grace period before first reminder
  includeItemsListInDebtMessage?: boolean; // Include breakdown of purchased items in invoice WhatsApp
  includeExchangeRateInDebtMessage?: boolean; // Include USD equivalent based on live SP-Today bulletin
  debtReminderMessageTemplate?: string; // Custom periodic reminder template
  debtInvoiceMessageTemplate?: string; // Custom credit sale invoice template
  debtPaymentReceiptTemplate?: string; // Custom payment receipt template
  debtOverdueMessageTemplate?: string; // Custom overdue reminder template
  whatsappApiKey?: string; // WhatsApp Business Cloud API / Gateway Key (optional for headless direct sending)
  whatsappPhoneId?: string; // WhatsApp Phone Number ID
  whatsappPhoneNumberId?: string; // WhatsApp Phone Number ID (alias)
}

export interface Branch {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  address: string;
  phone: string;
  isMain: boolean;
  active: boolean;
}

export type DeviceRole = 
  | 'master_pos'
  | 'secondary_pos'
  | 'kitchen_display'
  | 'customer_display'
  | 'waiter_mobile'
  | 'stock_scanner';

export interface LinkedDevice {
  id: string;
  name: string;
  role: DeviceRole;
  ipAddress?: string;
  browser?: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  pairingCode: string;
  pairedAt: string;
  lastSeen: string;
  isOnline: boolean;
  batteryLevel?: number;
  cashierName?: string;
  currentScreen?: string;
  branchName?: string;
}

export interface KitchenOrderItem {
  id: string;
  productId: string;
  nameAr: string;
  nameEn: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  status: 'pending' | 'cooking' | 'ready' | 'served';
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  saleId?: string;
  sourceDevice: string;
  diningType: DiningType;
  tableName?: string;
  guestCount?: number;
  items: KitchenOrderItem[];
  status: 'pending' | 'in_progress' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  estimatedMinutes?: number;
  notes?: string;
}

export interface Supplier {
  id: string;
  code: string; // e.g. SUP-101
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  address?: string;
  category?: string; // e.g. مشروبات، مواد غذائية، تعبئة وتغليف
  commercialRecord?: string;
  taxNumber?: string;
  currentDebt: number; // المبلغ المستحق للمورد (دائن)
  totalPurchases: number;
  paymentTerms?: string;
  bankAccount?: string;
  notes?: string;
  createdAt: string;
  lastPaymentDate?: string;
}

export type DebtPartyType = 'customer' | 'supplier';
export type DebtTransactionType = 'payment' | 'charge' | 'adjustment' | 'discount';

export interface DebtTransaction {
  id: string;
  voucherNumber: string; // e.g. VCH-REC-1001 or VCH-PAY-2001
  partyType: DebtPartyType;
  partyId: string;
  partyName: string;
  type: DebtTransactionType; // 'payment' (سداد/قبض), 'charge' (إضافة دين/فاتورة), 'adjustment' (تسوية), 'discount' (خصم)
  amount: number;
  discountAmount?: number;
  previousBalance: number;
  newBalance: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'check';
  referenceInvoice?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'pos'
  | 'trade'
  | 'debts'
  | 'ai'
  | 'products'
  | 'inventory'
  | 'customers'
  | 'invoices'
  | 'returns'
  | 'expenses'
  | 'reports'
  | 'staff'
  | 'devices'
  | 'settings'
  | 'about';

