import { getUsdcBalance, setUsdcBalance, usePortfolio } from "@/lib/portfolioStore";

/**
 * Kimaex is Naira-first. All crypto settlement happens behind the scenes;
 * the customer only ever sees ₦.
 */
export const NGN_PER_USD = 1580;

export const fmtNGN = (value: number, dp = 2) =>
  "₦" +
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(value);

/** Compact display, e.g. ₦1.2M */
export const fmtNGNShort = (value: number) => {
  if (Math.abs(value) >= 1_000_000_000) return `₦${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `₦${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `₦${(value / 1_000).toFixed(1)}K`;
  return fmtNGN(value, 2);
};

export const usdToNgn = (usd: number) => usd * NGN_PER_USD;
export const ngnToUsd = (ngn: number) => ngn / NGN_PER_USD;

export const getNairaBalance = () => usdToNgn(getUsdcBalance());
export const setNairaBalance = (ngn: number) => setUsdcBalance(ngnToUsd(ngn));
export const creditNaira = (ngn: number) => setNairaBalance(getNairaBalance() + ngn);
export const debitNaira = (ngn: number) => setNairaBalance(Math.max(0, getNairaBalance() - ngn));

/** Reactive Naira balance for components. */
export const useNaira = () => {
  const { usdc } = usePortfolio();
  return { balance: usdToNgn(usdc), credit: creditNaira, debit: debitNaira };
};

export interface Beneficiary {
  id: string;
  bank: string;
  accountNumber: string;
  accountName: string;
}

const BENEFICIARY_KEY = "kimaex_beneficiaries";

export const getBeneficiaries = (): Beneficiary[] => {
  try {
    return JSON.parse(localStorage.getItem(BENEFICIARY_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveBeneficiary = (b: Beneficiary) => {
  const all = getBeneficiaries().filter(
    (x) => !(x.accountNumber === b.accountNumber && x.bank === b.bank)
  );
  localStorage.setItem(BENEFICIARY_KEY, JSON.stringify([b, ...all].slice(0, 20)));
};

export const removeBeneficiary = (id: string) => {
  localStorage.setItem(
    BENEFICIARY_KEY,
    JSON.stringify(getBeneficiaries().filter((b) => b.id !== id))
  );
};

export const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Globus Bank",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Keystone Bank",
  "Kuda Microfinance Bank",
  "Moniepoint MFB",
  "OPay",
  "PalmPay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "SunTrust Bank",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

/** Flat platform withdrawal fee, Nigerian fintech style. */
export const WITHDRAWAL_FEE_NGN = 20;
