import { CurrencyConfig, ExchangeRateBulletin } from '../types';

export interface CurrencyPreset {
  code: string;
  nameAr: string;
  nameEn: string;
  symbol: string;
  symbolNative: string;
  decimals: number;
  flag: string;
  // Approximate default exchange rate (Base: 1 USD)
  defaultUsdRate: number;
  countryAr: string;
}

export const CURRENCY_PRESETS: CurrencyPreset[] = [
  {
    code: 'SYP',
    nameAr: 'الليرة السورية',
    nameEn: 'Syrian Pound',
    symbol: 'ل.س',
    symbolNative: 'ل.س',
    decimals: 0,
    flag: '🇸🇾',
    defaultUsdRate: 14800,
    countryAr: 'سوريا'
  },
  {
    code: 'USD',
    nameAr: 'الدولار الأمريكي',
    nameEn: 'US Dollar',
    symbol: '$',
    symbolNative: '$',
    decimals: 2,
    flag: '🇺🇸',
    defaultUsdRate: 1,
    countryAr: 'الولايات المتحدة'
  },
  {
    code: 'EUR',
    nameAr: 'اليورو الأوروبي',
    nameEn: 'Euro',
    symbol: '€',
    symbolNative: '€',
    decimals: 2,
    flag: '🇪🇺',
    defaultUsdRate: 0.92,
    countryAr: 'الاتحاد الأوروبي'
  },
  {
    code: 'SAR',
    nameAr: 'الريال السعودي',
    nameEn: 'Saudi Riyal',
    symbol: 'ر.س',
    symbolNative: 'ر.س',
    decimals: 2,
    flag: '🇸🇦',
    defaultUsdRate: 3.75,
    countryAr: 'المملكة العربية السعودية'
  },
  {
    code: 'AED',
    nameAr: 'الدرهم الإماراتي',
    nameEn: 'UAE Dirham',
    symbol: 'د.إ',
    symbolNative: 'د.إ',
    decimals: 2,
    flag: '🇦🇪',
    defaultUsdRate: 3.67,
    countryAr: 'الإمارات العربية المتحدة'
  },
  {
    code: 'TRY',
    nameAr: 'الليرة التركية',
    nameEn: 'Turkish Lira',
    symbol: '₺',
    symbolNative: '₺',
    decimals: 2,
    flag: '🇹🇷',
    defaultUsdRate: 38.5,
    countryAr: 'تركيا'
  },
  {
    code: 'IQD',
    nameAr: 'الدينار العراقي',
    nameEn: 'Iraqi Dinar',
    symbol: 'د.ع',
    symbolNative: 'د.ع',
    decimals: 0,
    flag: '🇮🇶',
    defaultUsdRate: 1310,
    countryAr: 'العراق'
  },
  {
    code: 'EGP',
    nameAr: 'الجنيه المصري',
    nameEn: 'Egyptian Pound',
    symbol: 'ج.م',
    symbolNative: 'ج.م',
    decimals: 2,
    flag: '🇪🇬',
    defaultUsdRate: 50.2,
    countryAr: 'مصر'
  },
  {
    code: 'JOD',
    nameAr: 'الدينار الأردني',
    nameEn: 'Jordanian Dinar',
    symbol: 'د.أ',
    symbolNative: 'د.أ',
    decimals: 3,
    flag: '🇯🇴',
    defaultUsdRate: 0.709,
    countryAr: 'الأردن'
  },
  {
    code: 'KWD',
    nameAr: 'الدينار الكويتي',
    nameEn: 'Kuwaiti Dinar',
    symbol: 'د.ك',
    symbolNative: 'د.ك',
    decimals: 3,
    flag: '🇰🇼',
    defaultUsdRate: 0.307,
    countryAr: 'الكويت'
  },
  {
    code: 'QAR',
    nameAr: 'الريال القطري',
    nameEn: 'Qatari Riyal',
    symbol: 'ر.ق',
    symbolNative: 'ر.ق',
    decimals: 2,
    flag: '🇶🇦',
    defaultUsdRate: 3.64,
    countryAr: 'قطر'
  },
  {
    code: 'OMR',
    nameAr: 'الريال العماني',
    nameEn: 'Omani Rial',
    symbol: 'ر.ع',
    symbolNative: 'ر.ع',
    decimals: 3,
    flag: '🇴🇲',
    defaultUsdRate: 0.384,
    countryAr: 'سلطنة عمان'
  },
  {
    code: 'BHD',
    nameAr: 'الدينار البحريني',
    nameEn: 'Bahraini Dinar',
    symbol: 'د.ب',
    symbolNative: 'د.ب',
    decimals: 3,
    flag: '🇧🇭',
    defaultUsdRate: 0.376,
    countryAr: 'البحرين'
  },
  {
    code: 'LBP',
    nameAr: 'الليرة اللبنانية',
    nameEn: 'Lebanese Pound',
    symbol: 'ل.ل',
    symbolNative: 'ل.ل',
    decimals: 0,
    flag: '🇱🇧',
    defaultUsdRate: 89500,
    countryAr: 'لبنان'
  },
  {
    code: 'GBP',
    nameAr: 'الجنيه الإسترليني',
    nameEn: 'British Pound',
    symbol: '£',
    symbolNative: '£',
    decimals: 2,
    flag: '🇬🇧',
    defaultUsdRate: 0.79,
    countryAr: 'المملكة المتحدة'
  }
];

export const defaultExchangeBulletin: ExchangeRateBulletin = {
  usdBuyRate: 14800,
  usdSellRate: 14950,
  eurBuyRate: 16100,
  eurSellRate: 16250,
  goldGram21: 1050000,
  centralBankOfficialRate: 13500,
  lastUpdated: new Date().toISOString(),
  sourceLabel: 'نشرة أسعار الصرف اليومية للمتجر',
  displayInHeader: true,
  displayInPosCart: true,
  displayInReceipts: true,
  preferredDisplay: 'BOTH'
};

/**
 * Format an amount in a secondary currency (e.g. USD or EUR) based on the current bulletin rate
 */
export function formatSecondaryCurrency(
  baseAmount: number,
  targetCurrency: 'USD' | 'EUR',
  bulletin?: ExchangeRateBulletin,
  rateType: 'buy' | 'sell' = 'sell'
): string {
  if (!bulletin || baseAmount <= 0) return '';
  const rate = targetCurrency === 'USD' 
    ? (rateType === 'buy' ? bulletin.usdBuyRate : bulletin.usdSellRate)
    : (rateType === 'buy' ? bulletin.eurBuyRate : bulletin.eurSellRate);

  if (!rate || rate <= 0) return '';
  
  const converted = baseAmount / rate;
  const symbol = targetCurrency === 'USD' ? '$' : '€';
  
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(converted);

  return `${symbol}${formatted}`;
}

/**
 * Calculate converted amount from Base to USD or EUR
 */
export function convertBaseToForeign(
  baseAmount: number,
  targetCurrency: 'USD' | 'EUR',
  bulletin?: ExchangeRateBulletin,
  rateType: 'buy' | 'sell' = 'sell'
): number {
  if (!bulletin || baseAmount <= 0) return 0;
  const rate = targetCurrency === 'USD' 
    ? (rateType === 'buy' ? bulletin.usdBuyRate : bulletin.usdSellRate)
    : (rateType === 'buy' ? bulletin.eurBuyRate : bulletin.eurSellRate);
  if (!rate || rate <= 0) return 0;
  return Number((baseAmount / rate).toFixed(2));
}

/**
 * Fetch Live Syrian Lira Exchange Rate from "Waqt Al-Lira / SP-Today" API endpoint
 */
export async function fetchLiveSyrianLiraRates(): Promise<{
  success: boolean;
  rates?: {
    usdBuy: number;
    usdSell: number;
    eurBuy: number;
    eurSell: number;
    goldGram21: number;
    centralBankOfficial: number;
    lastUpdated: string;
    source: string;
  };
  error?: string;
}> {
  try {
    const res = await fetch('/api/rates/sp-today', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      rates: data.rates,
    };
  } catch (err: any) {
    console.warn('Direct live rate fetch failed:', err);
    return {
      success: false,
      error: err.message || 'تعذر الاتصال بموقع الليرة اليوم',
    };
  }
}

