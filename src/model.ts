import type { Business, Currency, Draft, DocKey, Entry, EntryKind, EvidenceFile, Language } from './types';

export const blankBusiness: Business = { name: '', type: '', location: '', years: '' };
export const emptyDraft = (): Draft => ({
  business: { ...blankBusiness },
  entries: [],
  documents: { identity: false, bankHistory: false, registration: false },
  sample: false,
});

const day = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};
export const today = () => day(new Date());

export function sampleDraft(): Draft {
  const date = today();
  const makeEntry = (kind: EntryKind, amount: number, category: string, n: number): Entry => ({
    id: `demo-${kind}-${n}`, kind, amount, currency: 'KHR', category, date,
    note: 'Illustrative example only',
  });
  return {
    business: { name: 'Sokha Corner Shop', type: 'Neighborhood grocery', location: 'Phnom Penh', years: '3' },
    entries: [
      makeEntry('income', 400000, 'Store sales', 1),
      makeEntry('income', 600000, 'Store sales', 2),
      makeEntry('income', 350000, 'Store sales', 3),
      makeEntry('expense', 175000, 'Inventory', 1),
      makeEntry('expense', 100000, 'Utilities', 2),
      makeEntry('expense', 125000, 'Transport', 3),
    ],
    documents: { identity: true, bankHistory: false, registration: false },
    sample: true,
  };
}

export interface CheckItem {
  id: string;
  points: number;
  done: boolean;
  en: string;
  km: string;
  detailEn: string;
  detailKm: string;
}
export function getChecklist(draft: Draft, evidence: EvidenceFile[]): CheckItem[] {
  const { business, entries, documents } = draft;
  const income = entries.filter(item => item.kind === 'income');
  const expenses = entries.filter(item => item.kind === 'expense');
  return [
    { id: 'business', points: 15, done: !!(business.name.trim() && business.type.trim()), en: 'Business name & activity', km: 'ឈ្មោះ និងប្រភេទអាជីវកម្ម', detailEn: 'Name your business and describe what it sells.', detailKm: 'បញ្ចូលឈ្មោះ និងអ្វីដែលអាជីវកម្មលក់។' },
    { id: 'location', points: 10, done: !!(business.location.trim() && business.years.trim()), en: 'Location & operating history', km: 'ទីតាំង និងរយៈពេលប្រតិបត្តិការ', detailEn: 'Add a location and years in operation.', detailKm: 'បញ្ចូលទីតាំង និងចំនួនឆ្នាំដែលបើកដំណើរការ។' },
    { id: 'income', points: 20, done: income.length >= 3, en: 'Three income entries', km: 'កំណត់ត្រាចំណូល ៣ ប្រតិបត្តិការ', detailEn: `${income.length}/3 entries · Record sales or other money received.`, detailKm: `${income.length}/៣ ប្រតិបត្តិការ · កត់ត្រាប្រាក់លក់ ឬប្រាក់ចូល។` },
    { id: 'expenses', points: 15, done: expenses.length >= 3, en: 'Three expense entries', km: 'កំណត់ត្រាចំណាយ ៣ ប្រតិបត្តិការ', detailEn: `${expenses.length}/3 entries · Record purchases and running costs.`, detailKm: `${expenses.length}/៣ ប្រតិបត្តិការ · កត់ត្រាចំណាយប្រចាំថ្ងៃ។` },
    { id: 'evidence', points: 10, done: evidence.length > 0, en: 'Supporting record photo', km: 'រូបថតឯកសារយោង', detailEn: 'Add a cashbook or transaction-history image for your review.', detailKm: 'បន្ថែមរូបថតសៀវភៅកត់ត្រា ឬប្រវត្តិប្រតិបត្តិការ។' },
    { id: 'identity', points: 10, done: documents.identity, en: 'Identity document available', km: 'មានឯកសារអត្តសញ្ញាណ', detailEn: 'Mark this only if you have a valid document; do not upload it here.', detailKm: 'គូសសម្គាល់តែពេលមានឯកសារ។ កុំបង្ហោះឯកសារនេះនៅទីនេះ។' },
    { id: 'bankHistory', points: 20, done: documents.bankHistory, en: 'Account / transaction history available', km: 'មានប្រវត្តិគណនី ឬប្រតិបត្តិការ', detailEn: 'An account statement or accessible mobile-money history.', detailKm: 'របាយការណ៍គណនី ឬប្រវត្តិបង់ប្រាក់តាមទូរស័ព្ទ។' },
    { id: 'registration', points: 0, done: documents.registration, en: 'Business registration, if applicable', km: 'ឯកសារចុះបញ្ជីអាជីវកម្ម (បើមាន)', detailEn: 'Lenders have different rules. This is a preparation example, not a universal requirement.', detailKm: 'ស្ថាប័នហិរញ្ញវត្ថុមានលក្ខខណ្ឌខុសគ្នា។ នេះគ្រាន់តែជាឧទាហរណ៍។' },
  ];
}
export const readinessScore = (list: CheckItem[]) => list.reduce((total, item) => total + (item.done ? item.points : 0), 0);
export function totals(entries: Entry[], currency: Currency, month: string) {
  const subset = entries.filter(item => item.currency === currency && item.date.startsWith(month));
  const income = subset.filter(item => item.kind === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = subset.filter(item => item.kind === 'expense').reduce((sum, item) => sum + item.amount, 0);
  return { income, expense, difference: income - expense };
}
export function money(amount: number, currency: Currency, language: Language) {
  const rendered = Math.abs(amount).toLocaleString(language === 'km' ? 'km-KH' : 'en-US', {
    maximumFractionDigits: currency === 'KHR' ? 0 : 2,
    minimumFractionDigits: currency === 'KHR' ? 0 : 2,
  });
  return `${amount < 0 ? '−' : ''}${currency === 'KHR' ? '៛' : '$'}${rendered}`;
}
export const documentKeys: DocKey[] = ['identity', 'bankHistory', 'registration'];
export const monthLabel = (language: Language) => new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', { month: 'long', year: 'numeric' }).format(new Date());

export function profileText(draft: Draft, evidence: EvidenceFile[], language: Language) {
  const checks = getChecklist(draft, evidence);
  const score = readinessScore(checks);
  const currentMonth = today().slice(0, 7);
  const khr = totals(draft.entries, 'KHR', currentMonth);
  const usd = totals(draft.entries, 'USD', currentMonth);
  const labels = language === 'km'
    ? { title: 'ប្រវត្តិអាជីវកម្ម · SME Ready', name: 'អាជីវកម្ម', type: 'ប្រភេទ', location: 'ទីតាំង', years: 'រយៈពេល (ឆ្នាំ)', month: 'រយៈពេល', income: 'ប្រាក់ចូលដែលបានកត់ត្រា', expense: 'ប្រាក់ចេញដែលបានកត់ត្រា', difference: 'ភាពខុសគ្នានៃលំហូរសាច់ប្រាក់', score: 'ពិន្ទុត្រៀមឯកសារ', records: 'ចំនួនកំណត់ត្រា', note: 'កំណត់សម្គាល់៖ ព័ត៌មានផ្តល់ដោយម្ចាស់អាជីវកម្ម មិនបានផ្ទៀងផ្ទាត់ មិនមែនជាពិន្ទុឥណទាន ឬការធានាប្រាក់កម្ចីទេ។' }
    : { title: 'Business profile · SME Ready', name: 'Business', type: 'Activity', location: 'Location', years: 'Years operating', month: 'Period', income: 'Recorded money in', expense: 'Recorded money out', difference: 'Recorded cash-flow difference', score: 'Preparation checklist', records: 'Transaction entries', note: 'Owner-provided, unverified information. Not a credit score, loan offer, or promise of approval. Cash-flow difference is not profit or repayment capacity.' };
  const lines = [labels.title, '', `${labels.name}: ${draft.business.name || '—'}`, `${labels.type}: ${draft.business.type || '—'}`, `${labels.location}: ${draft.business.location || '—'}`, `${labels.years}: ${draft.business.years || '—'}`, `${labels.month}: ${monthLabel(language)}`, `${labels.records}: ${draft.entries.length}`, `${labels.score}: ${score}/100`];
  for (const [currency, result] of [['KHR', khr], ['USD', usd]] as const) {
    if (draft.entries.some(entry => entry.currency === currency && entry.date.startsWith(currentMonth))) {
      lines.push('', currency, `${labels.income}: ${money(result.income, currency, language)}`, `${labels.expense}: ${money(result.expense, currency, language)}`, `${labels.difference}: ${money(result.difference, currency, language)}`);
    }
  }
  lines.push('', ...checks.map(item => `${item.done ? '✓' : '○'} ${language === 'km' ? item.km : item.en}`), '', labels.note);
  return lines.join('\n');
}
