export type ZakaatCategory =
  | "Fakir / Miskin"
  | "Education & Orphans"
  | "Medical Relief"
  | "Masjid & Dawah"
  | "Debt Relief"
  | "Community Aid"
  | "Other";

export interface ZakaatEntry {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  recipient: string;
  category: ZakaatCategory;
  kind: "Zakaat" | "Sadaqah";
  notes?: string;
}

export type GrandfatherPurpose =
  | "Monthly Allowance"
  | "Medical & Care"
  | "Eid / Gift"
  | "Household"
  | "Travel / Comfort"
  | "Other";

export interface GrandfatherEntry {
  id: string;
  date: string;
  amount: number;
  purpose: GrandfatherPurpose;
  paymentMode: "UPI" | "Bank Transfer" | "Cash" | "Card";
  notes?: string;
}

export type EarningCategory =
  | "Salary"
  | "Business / Freelance"
  | "Halal Dividends / Yield"
  | "Rental"
  | "Bonus / Gift"
  | "Other";

export interface EarningEntry {
  id: string;
  date: string;
  amount: number;
  source: string;
  category: EarningCategory;
  halalVerified: boolean;
  notes?: string;
  autoAllocatedSummary?: string[];
}

export type AssetBucket =
  | "Savings"
  | "Investments"
  | "Gold & Silver"
  | "Real Estate"
  | "Business Equity";

export type HalalStatus =
  | "Verified Halal"
  | "Purification Needed"
  | "Under Review";

export interface AssetItem {
  id: string;
  name: string;
  bucket: AssetBucket;
  currentValue: number;
  investedAmount: number;
  halalStatus: HalalStatus;
  zakaatEligible: boolean;
  lastUpdated: string;
  notes?: string;
}

export interface BucketTransaction {
  id: string;
  date: string;
  amount: number;
  note: string;
  source: "manual" | "rule";
}

export interface CustomBucket {
  id: string;
  name: string;
  arabicLabel?: string;
  targetAmount: number;
  currentAmount: number;
  accent: "gold" | "emerald" | "amber";
  notes?: string;
  transactions: BucketTransaction[];
}

export interface AllocationRule {
  id: string;
  name: string;
  enabled: boolean;
  percentage: number;
  targetType: "zakaat_mission" | "grandfather_fund" | "custom_bucket";
  targetBucketId?: string;
  targetLabel: string;
  description: string;
}

export interface MizanSettings {
  displayName: string;
  zakaatMissionTarget: number; // Default 1,00,00,000 (1 Cr)
  nisabThreshold: number; // Editable Nisab in INR
  zakaatReserveBalance: number; // Pending Zakaat earmarked via rules
  grandfatherReserveBalance: number; // Pending Grandfather fund earmarked via rules
}

export interface MizanState {
  version: number;
  updatedAt: string;
  settings: MizanSettings;
  zakaatEntries: ZakaatEntry[];
  grandfatherEntries: GrandfatherEntry[];
  earningEntries: EarningEntry[];
  assets: AssetItem[];
  customBuckets: CustomBucket[];
  rules: AllocationRule[];
}

export type TabKey = "overview" | "zakaat" | "grandfather" | "wealth" | "rules";
