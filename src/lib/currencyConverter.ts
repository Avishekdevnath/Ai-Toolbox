// Currency conversion utility with real-time exchange rates
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRate {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

// Common currencies with their symbols
export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' }
];

// Cache for exchange rates (5 minutes)
let exchangeRateCache: ExchangeRate | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch real-time exchange rates from a free API
export async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRate> {
  const now = Date.now();
  
  // Return cached rates if still valid
  if (exchangeRateCache && 
      exchangeRateCache.base === baseCurrency && 
      (now - cacheTimestamp) < CACHE_DURATION) {
    return exchangeRateCache;
  }

  try {
    // Use exchangerate-api.com (free tier, no API key required)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.status}`);
    }

    const data = await response.json();
    
    const exchangeRate: ExchangeRate = {
      base: data.base,
      rates: data.rates,
      timestamp: now
    };

    // Cache the result
    exchangeRateCache = exchangeRate;
    cacheTimestamp = now;

    return exchangeRate;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Fallback to static rates if API fails
    return getFallbackExchangeRates(baseCurrency);
  }
}

// Fallback static exchange rates (approximate, updated periodically)
function getFallbackExchangeRates(baseCurrency: string): ExchangeRate {
  const staticRates: Record<string, Record<string, number>> = {
    USD: {
      EUR: 0.85, GBP: 0.73, JPY: 110.0, CAD: 1.25, AUD: 1.35,
      CHF: 0.92, CNY: 6.45, INR: 74.5, BRL: 5.25, MXN: 20.0,
      KRW: 1150.0, SGD: 1.35, NZD: 1.40, SEK: 8.5, NOK: 8.8,
      DKK: 6.3, PLN: 3.8, CZK: 21.5, HUF: 300.0
    },
    EUR: {
      USD: 1.18, GBP: 0.86, JPY: 129.0, CAD: 1.47, AUD: 1.59,
      CHF: 1.08, CNY: 7.59, INR: 87.6, BRL: 6.18, MXN: 23.5,
      KRW: 1353.0, SGD: 1.59, NZD: 1.65, SEK: 10.0, NOK: 10.4,
      DKK: 7.4, PLN: 4.47, CZK: 25.3, HUF: 353.0
    }
  };

  const rates = staticRates[baseCurrency] || staticRates.USD;
  
  return {
    base: baseCurrency,
    rates: { [baseCurrency]: 1, ...rates },
    timestamp: Date.now()
  };
}

// Convert currency using real-time rates
export async function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const exchangeRates = await fetchExchangeRates(fromCurrency);
    
    if (exchangeRates.rates[toCurrency]) {
      return amount * exchangeRates.rates[toCurrency];
    } else {
      throw new Error(`Exchange rate not available for ${toCurrency}`);
    }
  } catch (error) {
    console.error('Currency conversion error:', error);
    throw new Error('Failed to convert currency. Please try again.');
  }
}

// Get all available currencies
export function getCurrencies(): Currency[] {
  return CURRENCIES;
}

// Get currency by code
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find(currency => currency.code === code);
}

// Format currency amount
export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${amount} ${currencyCode}`;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
} 