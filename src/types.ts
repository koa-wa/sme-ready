export type Language = 'en' | 'km';
export type Currency = 'KHR' | 'USD';
export type Tab = 'home' | 'records' | 'readiness' | 'profile' | 'learn';
export type EntryKind = 'income' | 'expense';
export type DocKey = 'identity' | 'bankHistory' | 'registration';

export interface Business {
  name: string;
  type: string;
  location: string;
  years: string;
}

export interface Entry {
  id: string;
  kind: EntryKind;
  amount: number;
  currency: Currency;
  category: string;
  date: string;
  note: string;
}

export interface EvidenceFile {
  id: string;
  name: string;
  url: string;
  mime: string;
}

export interface Draft {
  business: Business;
  entries: Entry[];
  documents: Record<DocKey, boolean>;
  sample: boolean;
}
