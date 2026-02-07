import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
  rate: number; // Exchange rate to USD
}

// African currencies with mock exchange rates (USD to local currency)
export const africanCurrencies: Currency[] = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", country: "Nigeria", rate: 1580 },
  { code: "ZAR", symbol: "R", name: "South African Rand", country: "South Africa", rate: 18.5 },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", country: "Egypt", rate: 30.9 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", country: "Kenya", rate: 153 },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", country: "Ghana", rate: 12.5 },
  { code: "MAD", symbol: "MAD", name: "Moroccan Dirham", country: "Morocco", rate: 10.1 },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", country: "Tanzania", rate: 2520 },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling", country: "Uganda", rate: 3780 },
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr", country: "Ethiopia", rate: 56.5 },
  { code: "XOF", symbol: "CFA", name: "West African CFA Franc", country: "West Africa", rate: 610 },
  { code: "XAF", symbol: "FCFA", name: "Central African CFA Franc", country: "Central Africa", rate: 610 },
  { code: "DZD", symbol: "DA", name: "Algerian Dinar", country: "Algeria", rate: 135 },
  { code: "TND", symbol: "DT", name: "Tunisian Dinar", country: "Tunisia", rate: 3.12 },
  { code: "LYD", symbol: "LD", name: "Libyan Dinar", country: "Libya", rate: 4.85 },
  { code: "SDG", symbol: "SDG", name: "Sudanese Pound", country: "Sudan", rate: 601 },
  { code: "AOA", symbol: "Kz", name: "Angolan Kwanza", country: "Angola", rate: 830 },
  { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha", country: "Zambia", rate: 24.5 },
  { code: "MWK", symbol: "MK", name: "Malawian Kwacha", country: "Malawi", rate: 1690 },
  { code: "BWP", symbol: "P", name: "Botswanan Pula", country: "Botswana", rate: 13.6 },
  { code: "NAD", symbol: "N$", name: "Namibian Dollar", country: "Namibia", rate: 18.5 },
  { code: "MZN", symbol: "MT", name: "Mozambican Metical", country: "Mozambique", rate: 63.5 },
  { code: "RWF", symbol: "FRw", name: "Rwandan Franc", country: "Rwanda", rate: 1280 },
  { code: "BIF", symbol: "FBu", name: "Burundian Franc", country: "Burundi", rate: 2850 },
  { code: "CDF", symbol: "FC", name: "Congolese Franc", country: "DR Congo", rate: 2750 },
  { code: "SZL", symbol: "E", name: "Swazi Lilangeni", country: "Eswatini", rate: 18.5 },
  { code: "LSL", symbol: "L", name: "Lesotho Loti", country: "Lesotho", rate: 18.5 },
  { code: "GMD", symbol: "D", name: "Gambian Dalasi", country: "Gambia", rate: 67.5 },
  { code: "SLL", symbol: "Le", name: "Sierra Leonean Leone", country: "Sierra Leone", rate: 22500 },
  { code: "LRD", symbol: "L$", name: "Liberian Dollar", country: "Liberia", rate: 192 },
  { code: "GNF", symbol: "FG", name: "Guinean Franc", country: "Guinea", rate: 8600 },
  { code: "MRU", symbol: "UM", name: "Mauritanian Ouguiya", country: "Mauritania", rate: 39.5 },
  { code: "CVE", symbol: "Esc", name: "Cape Verdean Escudo", country: "Cape Verde", rate: 102 },
  { code: "STN", symbol: "Db", name: "São Tomé Dobra", country: "São Tomé", rate: 22.8 },
  { code: "SCR", symbol: "SR", name: "Seychellois Rupee", country: "Seychelles", rate: 13.2 },
  { code: "MUR", symbol: "Rs", name: "Mauritian Rupee", country: "Mauritius", rate: 45.5 },
  { code: "MGA", symbol: "Ar", name: "Malagasy Ariary", country: "Madagascar", rate: 4520 },
  { code: "KMF", symbol: "CF", name: "Comorian Franc", country: "Comoros", rate: 458 },
  { code: "DJF", symbol: "Fdj", name: "Djiboutian Franc", country: "Djibouti", rate: 178 },
  { code: "ERN", symbol: "Nfk", name: "Eritrean Nakfa", country: "Eritrea", rate: 15 },
  { code: "SOS", symbol: "Sh.So.", name: "Somali Shilling", country: "Somalia", rate: 571 },
  { code: "SSP", symbol: "SSP", name: "South Sudanese Pound", country: "South Sudan", rate: 130 },
  { code: "ZWL", symbol: "Z$", name: "Zimbabwean Dollar", country: "Zimbabwe", rate: 322 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (usdAmount: number, showSymbol?: boolean) => string;
  convertToLocal: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('selectedCurrency');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return africanCurrencies[0];
      }
    }
    return africanCurrencies[0];
  });

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('selectedCurrency', JSON.stringify(newCurrency));
  };

  const convertToLocal = (usdAmount: number): number => {
    return usdAmount * currency.rate;
  };

  const formatPrice = (usdAmount: number, showSymbol = true): string => {
    const localAmount = convertToLocal(usdAmount);
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(localAmount);
    return showSymbol ? `${currency.symbol}${formatted}` : formatted;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertToLocal }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
