/**
 * IndexedDB Service for Kian Cashier (كيان كاشير)
 * 
 * Provides robust offline-first persistence for:
 * - Products, categories, and barcodes
 * - Customers, loyalty points, and debt ledgers
 * - Invoices, receipts, and sales transactions
 * - Offline mutations queue (auto-synced when internet reconnects)
 * - Cross-device data transfer packages
 */

import { Product, Category, Customer, Sale, StoreSettings } from '../types';

const DB_NAME = 'KianCashier_OfflineDB';
const DB_VERSION = 2;

export interface OfflineQueueItem {
  id?: number;
  actionType: 'CREATE_SALE' | 'ADJUST_STOCK' | 'RECORD_DEBT_PAYMENT' | 'ADD_CUSTOMER' | 'SYNC_SETTINGS';
  payload: any;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  errorMessage?: string;
}

export interface DeviceTransferPackage {
  transferCode: string;
  senderDeviceId?: string;
  senderDeviceName: string;
  createdAt: string;
  expiresAt: string;
  transferType: 'all' | 'products' | 'customers' | 'sales' | 'settings';
  summary: {
    productsCount: number;
    categoriesCount: number;
    customersCount: number;
    salesCount: number;
    hasSettings: boolean;
  };
  data: {
    products?: Product[];
    categories?: Category[];
    customers?: Customer[];
    sales?: Sale[];
    settings?: Partial<StoreSettings>;
  };
  notes?: string;
}

export interface StorageStats {
  productsCount: number;
  customersCount: number;
  salesCount: number;
  offlineQueueCount: number;
  usageBytes: number;
  quotaBytes: number;
  percentUsed: number;
  lastSyncTime: string | null;
}

class IndexedDbService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initializes or gets existing IndexedDB connection
   */
  async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB غير مدعوم في هذا المتصفح'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Products Store
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('barcode', 'barcode', { unique: false });
          productStore.createIndex('category', 'category', { unique: false });
          productStore.createIndex('sku', 'sku', { unique: false });
        }

        // Categories Store
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        // Customers Store
        if (!db.objectStoreNames.contains('customers')) {
          const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
          customerStore.createIndex('phone', 'phone', { unique: false });
          customerStore.createIndex('customerCode', 'customerCode', { unique: false });
        }

        // Sales Store
        if (!db.objectStoreNames.contains('sales')) {
          const saleStore = db.createObjectStore('sales', { keyPath: 'id' });
          saleStore.createIndex('createdAt', 'createdAt', { unique: false });
          saleStore.createIndex('invoiceNumber', 'invoiceNumber', { unique: false });
          saleStore.createIndex('paymentStatus', 'paymentStatus', { unique: false });
        }

        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        // Offline Mutation Queue Store
        if (!db.objectStoreNames.contains('offline_queue')) {
          const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('status', 'status', { unique: false });
          queueStore.createIndex('createdAt', 'createdAt', { unique: false });
          queueStore.createIndex('actionType', 'actionType', { unique: false });
        }

        // Device Transfers Store
        if (!db.objectStoreNames.contains('device_transfers')) {
          const transferStore = db.createObjectStore('device_transfers', { keyPath: 'transferCode' });
          transferStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // App Meta / Cache Store
        if (!db.objectStoreNames.contains('app_meta')) {
          db.createObjectStore('app_meta', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        console.error('Failed to open IndexedDB:', error);
        reject(error);
      };
    });

    return this.initPromise;
  }

  /**
   * Synchronize full in-memory state into IndexedDB (Products, Categories, Customers, Sales, Settings)
   */
  async cacheAllData(data: {
    products?: Product[];
    categories?: Category[];
    customers?: Customer[];
    sales?: Sale[];
    settings?: StoreSettings;
  }): Promise<void> {
    try {
      const db = await this.getDB();

      // Batch write products
      if (data.products && data.products.length > 0) {
        await this.bulkPut('products', data.products);
      }

      // Batch write categories
      if (data.categories && data.categories.length > 0) {
        await this.bulkPut('categories', data.categories);
      }

      // Batch write customers
      if (data.customers && data.customers.length > 0) {
        await this.bulkPut('customers', data.customers);
      }

      // Batch write sales
      if (data.sales && data.sales.length > 0) {
        await this.bulkPut('sales', data.sales);
      }

      // Write settings
      if (data.settings) {
        await this.putOne('settings', { id: 'current_store_settings', ...data.settings });
      }

      // Update metadata
      await this.putOne('app_meta', {
        key: 'last_cache_timestamp',
        value: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Error caching data to IndexedDB:', err);
    }
  }

  /**
   * Restore all cached state from IndexedDB when starting offline or recovering
   */
  async loadCachedData(): Promise<{
    products: Product[];
    categories: Category[];
    customers: Customer[];
    sales: Sale[];
    settings: StoreSettings | null;
  }> {
    try {
      const [products, categories, customers, sales, settingsRecord] = await Promise.all([
        this.getAll<Product>('products'),
        this.getAll<Category>('categories'),
        this.getAll<Customer>('customers'),
        this.getAll<Sale>('sales'),
        this.getOne<any>('settings', 'current_store_settings'),
      ]);

      let settings: StoreSettings | null = null;
      if (settingsRecord) {
        const { id, ...rest } = settingsRecord;
        settings = rest as StoreSettings;
      }

      return { products, categories, customers, sales, settings };
    } catch (err) {
      console.warn('Error loading cached data from IndexedDB:', err);
      return { products: [], categories: [], customers: [], sales: [], settings: null };
    }
  }

  /**
   * Enqueue an action performed while offline (e.g. sale, debt payment)
   */
  async enqueueOfflineAction(actionType: OfflineQueueItem['actionType'], payload: any): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offline_queue'], 'readwrite');
      const store = transaction.objectStore('offline_queue');

      const item: OfflineQueueItem = {
        actionType,
        payload,
        createdAt: new Date().toISOString(),
        status: 'pending',
        retryCount: 0,
      };

      const request = store.add(item);
      request.onsuccess = () => {
        resolve(request.result as number);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending offline queue items
   */
  async getPendingOfflineQueue(): Promise<OfflineQueueItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offline_queue'], 'readonly');
      const store = transaction.objectStore('offline_queue');
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Alias for getPendingOfflineQueue
   */
  async getPendingActions(): Promise<OfflineQueueItem[]> {
    return this.getPendingOfflineQueue();
  }

  /**
   * Mark a queue item as synced or update status
   */
  async updateQueueItemStatus(id: number, status: OfflineQueueItem['status'], errorMessage?: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offline_queue'], 'readwrite');
      const store = transaction.objectStore('offline_queue');
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: OfflineQueueItem = getReq.result;
        if (!item) return resolve();

        item.status = status;
        if (status === 'failed') {
          item.retryCount = (item.retryCount || 0) + 1;
          item.errorMessage = errorMessage;
        }
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  /**
   * Automatically synchronizes all pending offline items to the server
   */
  async syncOfflineQueueToServer(): Promise<{
    syncedCount: number;
    failedCount: number;
    total: number;
  }> {
    const pending = await this.getPendingOfflineQueue();
    if (pending.length === 0) {
      return { syncedCount: 0, failedCount: 0, total: 0 };
    }

    let syncedCount = 0;
    let failedCount = 0;

    try {
      // Send batch to server
      const response = await fetch('/api/sync/offline-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pending }),
      });

      if (response.ok) {
        const result = await response.json();
        // Mark all items as synced in IndexedDB
        for (const item of pending) {
          if (item.id) {
            await this.updateQueueItemStatus(item.id, 'synced');
            syncedCount++;
          }
        }

        // Clean up old synced items to preserve storage
        await this.purgeSyncedQueueItems();
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (err: any) {
      console.warn('Background sync failed, will retry later:', err);
      for (const item of pending) {
        if (item.id) {
          await this.updateQueueItemStatus(item.id, 'failed', err.message);
          failedCount++;
        }
      }
    }

    return { syncedCount, failedCount, total: pending.length };
  }

  /**
   * Delete already synced items older than 24 hours
   */
  async purgeSyncedQueueItems(): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['offline_queue'], 'readwrite');
      const store = transaction.objectStore('offline_queue');
      const index = store.index('status');
      const request = index.getAll('synced');

      request.onsuccess = () => {
        const items = request.result || [];
        for (const item of items) {
          if (item.id) store.delete(item.id);
        }
      };
    } catch (err) {
      console.warn('Failed to purge synced queue items:', err);
    }
  }

  /**
   * Save a staged Device Transfer Package (sent or received via pairing code)
   */
  async saveDeviceTransfer(pkg: DeviceTransferPackage): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['device_transfers'], 'readwrite');
      const store = transaction.objectStore('device_transfers');
      const request = store.put(pkg);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a Device Transfer Package by its 6-digit code from local IndexedDB
   */
  async getDeviceTransfer(transferCode: string): Promise<DeviceTransferPackage | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['device_transfers'], 'readonly');
      const store = transaction.objectStore('device_transfers');
      const request = store.get(transferCode.trim().toUpperCase());
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Calculate storage and record statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    try {
      const [products, customers, sales, queue] = await Promise.all([
        this.getAll<Product>('products'),
        this.getAll<Customer>('customers'),
        this.getAll<Sale>('sales'),
        this.getPendingOfflineQueue(),
      ]);

      let usageBytes = 0;
      let quotaBytes = 0;
      let percentUsed = 0;

      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        usageBytes = estimate.usage || 0;
        quotaBytes = estimate.quota || 0;
        percentUsed = quotaBytes > 0 ? Math.round((usageBytes / quotaBytes) * 100) : 0;
      }

      const meta = await this.getOne<any>('app_meta', 'last_cache_timestamp');

      return {
        productsCount: products.length,
        customersCount: customers.length,
        salesCount: sales.length,
        offlineQueueCount: queue.length,
        usageBytes,
        quotaBytes,
        percentUsed,
        lastSyncTime: meta?.value || null,
      };
    } catch (err) {
      return {
        productsCount: 0,
        customersCount: 0,
        salesCount: 0,
        offlineQueueCount: 0,
        usageBytes: 0,
        quotaBytes: 0,
        percentUsed: 0,
        lastSyncTime: null,
      };
    }
  }

  // --- Generic Helpers ---

  private async bulkPut<T>(storeName: string, items: T[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      items.forEach((item) => store.put(item));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private async putOne<T>(storeName: string, item: T): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getOne<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDbService = new IndexedDbService();
