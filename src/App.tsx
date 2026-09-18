import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import {
  ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Camera, Check, CheckCircle2,
  ChevronDown, ChevronRight, ClipboardCheck, Copy, FileText, Globe2, Home,
  Info, Landmark, LockKeyhole, Plus, Printer, ShieldCheck, Store, Trash2, Wallet, X,
} from 'lucide-react';
import {
  emptyDraft, getChecklist, money, monthLabel, profileText,
  readinessScore, sampleDraft, today, totals,
} from './model';
import { telegramApp } from './telegram';
import type { Business, Currency, DocKey, Draft, Entry, EntryKind, EvidenceFile, Language, Tab } from './types';

type Copy = [en: string, km: string];
const labels: Record<Tab, Copy> = {
  home: ['Home', 'ទំព័រដើម'], records: ['Records', 'កំណត់ត្រា'], readiness: ['Readiness', 'ការត្រៀមខ្លួន'],
  profile: ['Profile', 'ប្រវត្តិរូប'], learn: ['Learn', 'ស្វែងយល់'],
};
const docLabels: Record<DocKey, Copy> = {
  identity: ['Identity document available', 'មានឯកសារអត្តសញ្ញាណ'],
  bankHistory: ['Account or payment history available', 'មានប្រវត្តិគណនី ឬការទូទាត់'],
  registration: ['Registration (if applicable)', 'ការចុះបញ្ជី (បើមាន)'],
};
const tabs = [
  { id: 'home', icon: Home }, { id: 'records', icon: Wallet }, { id: 'readiness', icon: ClipboardCheck },
  { id: 'profile', icon: FileText }, { id: 'learn', icon: BookOpen },
] as const;
const lessons: { title: Copy; sub: Copy; body: Copy; icon: typeof Wallet }[] = [
  {
    title: ['Know what comes in and goes out', 'ស្គាល់ប្រាក់ចូល និងប្រាក់ចេញ'],
    sub: ['Start with a simple daily record', 'ចាប់ផ្តើមកត់ត្រាប្រចាំថ្ងៃ'], icon: Wallet,
    body: [
      'Write down every sale and cost, even if you use cash. A recorded cash-flow difference is not the same as profit: stock, existing debt, taxes, and other costs may still need to be considered.',
      'កត់ត្រារាល់ការលក់ និងចំណាយ ទោះប្រើសាច់ប្រាក់ក៏ដោយ។ ភាពខុសគ្នារវាងប្រាក់ចូល និងចេញមិនស្មើនឹងប្រាក់ចំណេញទេ ព្រោះនៅមានថ្លៃស្តុក បំណុល ពន្ធ និងចំណាយផ្សេងៗ។',
    ],
  },
  {
    title: ['Before you borrow', 'មុនពេលខ្ចីប្រាក់'],
    sub: ['Think beyond the monthly installment', 'ពិចារណាលើសពីការបង់ប្រចាំខែ'], icon: Landmark,
    body: [
      'Estimate what remains after normal expenses, existing repayments, and unexpected costs. Ask the lender for the full repayment schedule, total borrowing cost, fees, and consequences of late payment. Do not treat this demo as an affordability assessment.',
      'គណនាប្រាក់នៅសល់បន្ទាប់ពីចំណាយធម្មតា ការសងបំណុលចាស់ និងចំណាយបន្ទាន់។ សួរស្ថាប័នហិរញ្ញវត្ថុអំពីតារាងសងសរុប ការប្រាក់ ថ្លៃសេវា និងផលវិបាកនៃការបង់យឺត។ កម្មវិធីសាកល្បងនេះមិនមែនជាការវាយតម្លៃសមត្ថភាពសងទេ។',
    ],
  },
  {
    title: ['What might a lender ask for?', 'តើអ្នកផ្តល់កម្ចីអាចស្នើសុំអ្វីខ្លះ?'],
    sub: ['Requirements vary by institution', 'លក្ខខណ្ឌខុសគ្នាតាមស្ថាប័ន'], icon: FileText,
    body: [
      'A lender may ask for identity documents, business details, transaction records, or other supporting evidence. Registration and collateral requirements differ by product and institution. Confirm directly with the lender before sharing personal documents.',
      'ស្ថាប័នហិរញ្ញវត្ថុអាចស្នើឯកសារអត្តសញ្ញាណ ព័ត៌មានអាជីវកម្ម កំណត់ត្រាប្រតិបត្តិការ ឬឯកសារផ្សេងៗ។ លក្ខខណ្ឌចុះបញ្ជី និងទ្រព្យបញ្ចាំខុសគ្នា។ សូមបញ្ជាក់ជាមួយស្ថាប័នផ្ទាល់មុនចែករំលែកឯកសារផ្ទាល់ខ្លួន។',
    ],
  },
];

function Header({ language, setLanguage, sample }: { language: Language; setLanguage: (lang: Language) => void; sample: boolean }) {
  return <header className="app-header">
    <div className="brand-mark" aria-hidden="true"><span className="brand-leaf" /><span className="brand-dot" /></div>
    <div className="brand-title">SME<span> Ready</span><small>{language === 'en' ? 'Your business, better prepared' : 'រៀបចំអាជីវកម្មឱ្យរួចរាល់'}</small></div>
    <div className="header-actions">{sample && <span className="demo-chip">DEMO</span>}
      <button className="language-btn" onClick={() => setLanguage(language === 'en' ? 'km' : 'en')} aria-label="Change language"><Globe2 size={15} />{language === 'en' ? 'ខ្មែរ' : 'EN'}</button>
    </div>
  </header>;
}
function Card({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`surface ${className}`}>{children}</section>; }
function Heading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="section-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}
function Ring({ value, size = 'large' }: { value: number; size?: 'large' | 'small' }) {
  return <div className={`score-ring ${size}`} style={{ '--score': `${value}%` } as CSSProperties} aria-label={`Preparation score ${value} out of 100`}><div><strong>{value}</strong><span>/100</span></div></div>;
}

function HomeScreen({ draft, evidence, score, language, currency, setCurrency, onTab, onReset }: {
  draft: Draft; evidence: EvidenceFile[]; score: number; language: Language; currency: Currency;
  setCurrency: (currency: Currency) => void; onTab: (tab: Tab) => void; onReset: () => void;
}) {
  const t = (en: string, km: string) => language === 'en' ? en : km;
  const checks = getChecklist(draft, evidence);
  const missing = checks.find(item => !item.done);
  const thisMonth = totals(draft.entries, currency, today().slice(0, 7));
  return <div className="screen-stack">
    <section className="welcome">
      <div className="welcome-heading"><div><p className="eyebrow">{t('YOUR BUSINESS SPACE', 'កន្លែងសម្រាប់អាជីវកម្មរបស់អ្នក')}</p>
        <h1>{draft.business.name ? draft.business.name : t('Make your business loan-ready.', 'រៀបចំអាជីវកម្មឱ្យរួចរាល់សម្រាប់កម្ចី។')}</h1>
        <p className="welcome-sub">{t('Small steps toward clearer financial records.', 'ជំហានតូចៗដើម្បីមានកំណត់ត្រាហិរញ្ញវត្ថុកាន់តែច្បាស់។')}</p></div>
        <span className="welcome-illustration" aria-hidden="true"><Store size={32} strokeWidth={1.6} /></span>
      </div>
      {draft.sample && <div className="sample-note"><Info size={16} /><span>{t('Fictional example data. Nothing here belongs to a real business.', 'នេះជាទិន្នន័យឧទាហរណ៍ មិនមែនព័ត៌មានអាជីវកម្មពិតទេ។')}</span><button onClick={onReset}>{t('Start fresh', 'ចាប់ផ្តើមថ្មី')} <ArrowRight size={13}/></button></div>}
    </section>
    <Card className="score-feature"><div className="score-feature-top"><div><span className="mini-label">{t('YOUR PREPARATION', 'ការត្រៀមខ្លួនរបស់អ្នក')}</span><h2>{t('Loan readiness', 'ការត្រៀមសម្រាប់កម្ចី')}</h2>
      <p>{t('Based on the information you entered.', 'ផ្អែកលើព័ត៌មានដែលអ្នកបានបញ្ចូល។')}</p></div><Ring value={score} /></div>
      <div className="score-bottom"><span><CheckCircle2 size={16}/>{checks.filter(item => item.done).length} / {checks.length} {t('steps complete', 'ជំហានបានបញ្ចប់')}</span><button className="text-link light" onClick={() => onTab('readiness')}>{t('See checklist', 'មើលបញ្ជី')} <ArrowRight size={15}/></button></div>
    </Card>
    <div className="metrics-header"><Heading title={t('Your cash flow', 'លំហូរសាច់ប្រាក់')} subtitle={monthLabel(language)} />
      <select className="currency-select" value={currency} onChange={event => setCurrency(event.target.value as Currency)} aria-label={t('Display currency', 'រូបិយប័ណ្ណ')}><option value="KHR">KHR · ៛</option><option value="USD">USD · $</option></select></div>
    <div className="metric-grid"><Card className="metric-card"><div className="metric-icon in"><ArrowDownLeft size={17}/></div><span>{t('Money in', 'ប្រាក់ចូល')}</span><strong>{money(thisMonth.income, currency, language)}</strong></Card>
      <Card className="metric-card"><div className="metric-icon out"><ArrowUpRight size={17}/></div><span>{t('Money out', 'ប្រាក់ចេញ')}</span><strong>{money(thisMonth.expense, currency, language)}</strong></Card></div>
    <div className="cash-difference"><span>{t('Recorded difference', 'ភាពខុសគ្នាដែលបានកត់ត្រា')} <Info size={13}/></span><strong>{money(thisMonth.difference, currency, language)}</strong></div>
    <p className="micro-note">{t('This is not profit or a measure of your ability to repay a loan.', 'នេះមិនមែនជាប្រាក់ចំណេញ ឬសមត្ថភាពសងប្រាក់កម្ចីទេ។')}</p>
    <Card className="next-step"><div className="next-symbol"><ClipboardCheck size={22}/></div><div><span className="mini-label">{t('NEXT SMALL STEP', 'ជំហានបន្ទាប់')}</span><h3>{missing ? (language === 'en' ? missing.en : missing.km) : t('All demo steps complete', 'បានបញ្ចប់ជំហានសាកល្បងទាំងអស់')}</h3><p>{missing ? (language === 'en' ? missing.detailEn : missing.detailKm) : t('Check what your chosen lender actually requires.', 'សូមបញ្ជាក់លក្ខខណ្ឌពិតជាមួយស្ថាប័នហិរញ្ញវត្ថុ។')}</p><button className="text-link" onClick={() => onTab(missing?.id === 'income' || missing?.id === 'expenses' || missing?.id === 'evidence' ? 'records' : missing?.id === 'business' || missing?.id === 'location' ? 'profile' : 'readiness')}>{t('Continue', 'បន្ត')} <ArrowRight size={15}/></button></div></Card>
    <button className="primary-btn full" onClick={() => onTab('records')}><Plus size={18}/>{t('Add a transaction', 'បន្ថែមប្រតិបត្តិការ')}</button>
  </div>;
}

interface EntryForm { kind: EntryKind; amount: string; currency: Currency; category: string; date: string; note: string }
const initialEntry = (currency: Currency): EntryForm => ({ kind: 'income', amount: '', currency, category: '', date: today(), note: '' });
function RecordsScreen({ draft, evidence, language, currency, addEntry, deleteEntry, addFile, removeFile }: {
  draft: Draft; evidence: EvidenceFile[]; language: Language; currency: Currency; addEntry: (entry: Entry) => void;
  deleteEntry: (id: string) => void; addFile: (files: FileList) => void; removeFile: (id: string) => void;
}) {
  const t = (en: string, km: string) => language === 'en' ? en : km;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EntryForm>(() => initialEntry(currency));
  const [error, setError] = useState('');
  const sorted = [...draft.entries].sort((a, b) => b.date.localeCompare(a.date));
  const save = (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000_000) { setError(t('Enter a valid positive amount.', 'សូមបញ្ចូលចំនួនប្រាក់វិជ្ជមានត្រឹមត្រូវ។')); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date) || form.date > today() || form.date < '2000-01-01') { setError(t('Choose a valid date, not in the future.', 'សូមជ្រើសរើសកាលបរិច្ឆេទត្រឹមត្រូវ។')); return; }
    if (form.currency === 'KHR' && !Number.isInteger(amount)) { setError(t('Use a whole-number amount for riel.', 'សូមប្រើចំនួនគត់សម្រាប់ប្រាក់រៀល។')); return; }
    addEntry({ id: crypto.randomUUID(), kind: form.kind, amount, currency: form.currency, category: form.category.trim() || (form.kind === 'income' ? t('Sale', 'ការលក់') : t('Business cost', 'ចំណាយអាជីវកម្ម')), date: form.date, note: form.note.trim() });
    setOpen(false); setError(''); setForm(initialEntry(currency));
  };
  return <div className="screen-stack"><div className="page-intro"><span className="intro-icon"><Wallet size={22}/></span><h1>{t('Financial records', 'កំណត់ត្រាហិរញ្ញវត្ថុ')}</h1><p>{t('Build a clearer picture, one transaction at a time.', 'កត់ត្រាប្រតិបត្តិការម្តងមួយៗ ដើម្បីយល់ពីហិរញ្ញវត្ថុអាជីវកម្ម។')}</p></div>
    <Card><Heading title={t('Transaction history', 'ប្រវត្តិប្រតិបត្តិការ')} subtitle={t(`${draft.entries.length} entries · All currencies`, `${draft.entries.length} ប្រតិបត្តិការ · គ្រប់រូបិយប័ណ្ណ`)} action={<button className="small-action" onClick={() => { setForm(initialEntry(currency)); setOpen(true); }}><Plus size={16}/>{t('Add', 'បន្ថែម')}</button>}/>
      {sorted.length ? <div className="transaction-list">{sorted.map(entry => <div className="transaction" key={entry.id}><div className={`transaction-icon ${entry.kind}`} aria-hidden="true">{entry.kind === 'income' ? <ArrowDownLeft size={19}/> : <ArrowUpRight size={19}/>}</div>
        <div className="transaction-main"><strong>{entry.category}</strong><span>{entry.date}{entry.note ? ` · ${entry.note}` : ''}</span></div><div className="transaction-right"><strong className={entry.kind === 'income' ? 'positive' : ''}>{entry.kind === 'income' ? '+' : '−'}{money(entry.amount, entry.currency, language)}</strong><button className="icon-btn delete-btn" aria-label={t('Delete transaction', 'លុបប្រតិបត្តិការ')} onClick={() => { if (window.confirm(t('Delete this transaction?', 'លុបប្រតិបត្តិការនេះមែនទេ?'))) deleteEntry(entry.id); }}><Trash2 size={15}/></button></div></div>)}</div>
        : <div className="empty-state"><Wallet size={27}/><p>{t('No entries yet. Add your first sale or expense.', 'មិនទាន់មានកំណត់ត្រា។ បញ្ចូលការលក់ ឬចំណាយដំបូង។')}</p></div>}
    </Card>
    <Card className="upload-card"><div className="upload-head"><div className="upload-icon"><Camera size={21}/></div><div><h2>{t('Supporting records', 'ឯកសារយោង')}</h2><p>{t('Cashbook or Wing / Bakong history', 'សៀវភៅកត់ត្រា ឬប្រវត្តិ Wing / Bakong')}</p></div></div>
      <label className="upload-target"><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" multiple onChange={event => { if (event.currentTarget.files) addFile(event.currentTarget.files); event.currentTarget.value = ''; }}/><Plus size={19}/><span>{t('Choose photos or PDFs', 'ជ្រើសរើសរូបថត ឬ PDF')}</span><small>{t('Up to 5 MB each · reviewed by you only', 'មួយឯកសារមិនលើស ៥ MB · អ្នកពិនិត្យដោយខ្លួនឯង')}</small></label>
      {!!evidence.length && <div className="file-list">{evidence.map(file => <div className="file-row" key={file.id}><FileText size={18}/><a href={file.url} target="_blank" rel="noreferrer">{file.name}</a><button className="icon-btn" aria-label={t('Remove file', 'ដកឯកសារ')} onClick={() => removeFile(file.id)}><X size={17}/></button></div>)}</div>}
      <div className="privacy-inline"><LockKeyhole size={15}/>{t('No upload, OCR, or bank connection. Files stay in this browser session; enter transactions manually. Do not add identity documents.', 'មិនមានការបង្ហោះ ឬការអានរូបភាពស្វ័យប្រវត្តិទេ។ ឯកសារស្ថិតក្នុងសម័យកម្មវិធីនេះប៉ុណ្ណោះ។ សូមកត់ត្រាដោយដៃ និងកុំបន្ថែមឯកសារអត្តសញ្ញាណ។')}</div>
    </Card>
    {open && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="entry-title"><div className="modal-top"><h2 id="entry-title">{t('Add a transaction', 'បន្ថែមប្រតិបត្តិការ')}</h2><button className="icon-btn" aria-label="Close" onClick={() => setOpen(false)}><X size={21}/></button></div>
      <form onSubmit={save} className="entry-form"><div className="toggle-row"><button type="button" className={form.kind === 'income' ? 'selected' : ''} onClick={() => setForm({ ...form, kind: 'income' })}><ArrowDownLeft size={16}/>{t('Money in', 'ប្រាក់ចូល')}</button><button type="button" className={form.kind === 'expense' ? 'selected' : ''} onClick={() => setForm({ ...form, kind: 'expense' })}><ArrowUpRight size={16}/>{t('Money out', 'ប្រាក់ចេញ')}</button></div>
      <label>{t('Amount', 'ចំនួនប្រាក់')}<div className="amount-line"><input required autoFocus inputMode="decimal" type="number" min="0.01" max="1000000000000" step={form.currency === 'KHR' ? '1' : '0.01'} value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} placeholder="0"/><select value={form.currency} onChange={event => setForm({ ...form, currency: event.target.value as Currency })}><option value="KHR">KHR</option><option value="USD">USD</option></select></div></label>
      <label>{t('Category', 'ប្រភេទ')}<input maxLength={70} value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} placeholder={form.kind === 'income' ? t('e.g. Daily sales', 'ឧ. ការលក់ប្រចាំថ្ងៃ') : t('e.g. Inventory', 'ឧ. ទំនិញក្នុងស្តុក')}/></label>
      <label>{t('Date', 'កាលបរិច្ឆេទ')}<input type="date" required min="2000-01-01" max={today()} value={form.date} onChange={event => setForm({ ...form, date: event.target.value })}/></label>
      <label>{t('Note (optional)', 'កំណត់សម្គាល់ (ស្រេចចិត្ត)')}<input maxLength={120} value={form.note} onChange={event => setForm({ ...form, note: event.target.value })} placeholder={t('Something to remember', 'កំណត់សម្គាល់ខ្លីៗ')}/></label>
      {error && <p className="form-error" role="alert">{error}</p>}<button type="submit" className="primary-btn full">{t('Save transaction', 'រក្សាទុកប្រតិបត្តិការ')}<ArrowRight size={17}/></button></form></section></div>}
  </div>;
}

function ReadinessScreen({ draft, evidence, language, setDocument, onTab }: {
  draft: Draft; evidence: EvidenceFile[]; language: Language; setDocument: (key: DocKey, checked: boolean) => void; onTab: (tab: Tab) => void;
}) {
  const t = (en: string, km: string) => language === 'en' ? en : km;
  const checks = getChecklist(draft, evidence);
  const score = readinessScore(checks);
  return <div className="screen-stack"><div className="page-intro"><span className="intro-icon"><ClipboardCheck size={22}/></span><h1>{t('Get loan-ready', 'ត្រៀមខ្លួនសម្រាប់កម្ចី')}</h1><p>{t('See what you have and what you can prepare next.', 'ពិនិត្យអ្វីដែលមាន និងអ្វីដែលអាចរៀបចំបន្ថែម។')}</p></div>
    <Card className="readiness-overview"><Ring value={score}/><div><span className="mini-label">{t('PREPARATION ONLY', 'ការត្រៀមឯកសារប៉ុណ្ណោះ')}</span><h2>{checks.filter(item => item.done).length} {t('of', 'ក្នុងចំណោម')} {checks.length} {t('steps complete', 'ជំហានបានបញ្ចប់')}</h2><p>{t('A transparent example checklist — not a credit score or lender decision.', 'បញ្ជីឧទាហរណ៍ច្បាស់លាស់ មិនមែនជាពិន្ទុឥណទាន ឬសេចក្តីសម្រេចពីអ្នកផ្តល់កម្ចីទេ។')}</p></div></Card>
    <Heading title={t('Your checklist', 'បញ្ជីត្រៀមរបស់អ្នក')} subtitle={t('Each item shows its contribution to the example score.', 'ធាតុនីមួយៗបង្ហាញពិន្ទុឧទាហរណ៍។')}/>
    <Card className="checklist-card">{checks.map(item => <div className="check-row" key={item.id}><div className={`check-status ${item.done ? 'done' : ''}`}>{item.done ? <Check size={16}/> : null}</div><div className="check-main"><div className="check-title"><h3>{language === 'en' ? item.en : item.km}</h3><span>{item.points ? `+${item.points}` : t('Optional', 'ស្រេចចិត្ត')}</span></div><p>{language === 'en' ? item.detailEn : item.detailKm}</p>
      {item.id === 'business' || item.id === 'location' ? <button className="inline-action" onClick={() => onTab('profile')}>{t('Edit business details', 'កែព័ត៌មានអាជីវកម្ម')} <ChevronRight size={14}/></button> : item.id === 'income' || item.id === 'expenses' || item.id === 'evidence' ? <button className="inline-action" onClick={() => onTab('records')}>{t('Go to records', 'ទៅកំណត់ត្រា')} <ChevronRight size={14}/></button> : <label className="doc-checkbox"><input type="checkbox" checked={draft.documents[item.id as DocKey]} onChange={event => setDocument(item.id as DocKey, event.target.checked)}/>{t('I have this available', 'ខ្ញុំមានឯកសារនេះ')}</label>}
      </div></div>)}</Card>
    <div className="disclaimer"><ShieldCheck size={19}/><p>{t('This score is invented for this prototype. Real lenders use their own eligibility and verification processes. Do not upload identity documents here.', 'ពិន្ទុនេះត្រូវបានបង្កើតសម្រាប់គំរូសាកល្បងប៉ុណ្ណោះ។ ស្ថាប័នហិរញ្ញវត្ថុមានលក្ខខណ្ឌ និងការផ្ទៀងផ្ទាត់ផ្ទាល់ខ្លួន។ កុំបង្ហោះឯកសារអត្តសញ្ញាណនៅទីនេះ។')}</p></div>
  </div>;
}

function ProfileScreen({ draft, evidence, language, updateBusiness, onToast }: {
  draft: Draft; evidence: EvidenceFile[]; language: Language; updateBusiness: (business: Business) => void; onToast: (message: string) => void;
}) {
  const t = (en: string, km: string) => language === 'en' ? en : km;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...draft.business });
  const checks = getChecklist(draft, evidence);
  const score = readinessScore(checks);
  const month = today().slice(0, 7);
  const hasRecord = (currency: Currency) => draft.entries.some(entry => entry.currency === currency && entry.date.startsWith(month));
  const save = (event: FormEvent) => { event.preventDefault(); updateBusiness({ ...form, name: form.name.trim(), type: form.type.trim(), location: form.location.trim(), years: form.years.trim() }); setEditing(false); onToast(t('Business details updated.', 'បានកែព័ត៌មានអាជីវកម្ម។')); };
  const copyProfile = async () => {
    try { await navigator.clipboard.writeText(profileText(draft, evidence, language)); onToast(t('Summary copied. Review it before sharing.', 'បានចម្លងសេចក្តីសង្ខេប។ សូមពិនិត្យមុនចែករំលែក។')); }
    catch { onToast(t('Copy was blocked by your browser. Try Print / save PDF.', 'កម្មវិធីរុករកបានទប់ស្កាត់ការចម្លង។ សាកល្បងបោះពុម្ព / រក្សាទុក PDF។')); }
  };
  return <div className="screen-stack"><div className="page-intro"><span className="intro-icon"><FileText size={22}/></span><h1>{t('Business profile', 'ប្រវត្តិរូបអាជីវកម្ម')}</h1><p>{t('A simple, owner-prepared summary you control.', 'សេចក្តីសង្ខេបដែលម្ចាស់អាជីវកម្មរៀបចំដោយខ្លួនឯង។')}</p></div>
    <Card className="profile-paper" ><div className="profile-top"><div className="profile-logo"><span className="brand-mark small" aria-hidden="true"><span className="brand-leaf"/><span className="brand-dot"/></span> SME Ready</div><span>{t('OWNER-PREPARED', 'រៀបចំដោយម្ចាស់')}</span></div>
      <div className="profile-business"><span className="mini-label">{t('BUSINESS OVERVIEW', 'ទិដ្ឋភាពអាជីវកម្ម')}</span><h2>{draft.business.name || t('Your business name', 'ឈ្មោះអាជីវកម្មរបស់អ្នក')}</h2><p>{draft.business.type || t('Add a business activity', 'បន្ថែមប្រភេទអាជីវកម្ម')}</p></div>
      <div className="profile-details"><div><span>{t('Location', 'ទីតាំង')}</span><strong>{draft.business.location || '—'}</strong></div><div><span>{t('Years operating', 'ចំនួនឆ្នាំដំណើរការ')}</span><strong>{draft.business.years || '—'}</strong></div><div><span>{t('Preparation checklist', 'ពិន្ទុត្រៀម')}</span><strong>{score}/100</strong></div><div><span>{t('Recorded transactions', 'ប្រតិបត្តិការបានកត់ត្រា')}</span><strong>{draft.entries.length}</strong></div></div>
      <div className="profile-finances"><h3>{t('Recorded cash flow', 'លំហូរសាច់ប្រាក់ដែលបានកត់ត្រា')}</h3><span className="profile-period">{monthLabel(language)}</span>
        {(['KHR', 'USD'] as const).filter(hasRecord).map(unit => { const total = totals(draft.entries, unit, month); return <div className="profile-money" key={unit}><h4>{unit}</h4><div><span>{t('Money in', 'ប្រាក់ចូល')}</span><strong>{money(total.income, unit, language)}</strong></div><div><span>{t('Money out', 'ប្រាក់ចេញ')}</span><strong>{money(total.expense, unit, language)}</strong></div><div className="money-bottom"><span>{t('Recorded difference', 'ភាពខុសគ្នា')}</span><strong>{money(total.difference, unit, language)}</strong></div></div>; })}
        {!hasRecord('KHR') && !hasRecord('USD') && <p className="missing-copy">{t('No entries for this month yet.', 'មិនទាន់មានកំណត់ត្រាសម្រាប់ខែនេះ។')}</p>}
      </div>
      <p className="profile-footnote">{t('Self-reported and unverified. Not proof of income, profit, creditworthiness, or loan approval.', 'ព័ត៌មានផ្តល់ដោយខ្លួនឯង មិនបានផ្ទៀងផ្ទាត់។ មិនមែនជាភស្តុតាងចំណូល ប្រាក់ចំណេញ ឬការអនុម័តកម្ចីទេ។')}</p>
    </Card>
    <div className="profile-actions"><button className="primary-btn" onClick={() => window.print()}><Printer size={16}/>{t('Print / save PDF', 'បោះពុម្ព / រក្សាទុក PDF')}</button><button className="secondary-btn" onClick={copyProfile}><Copy size={16}/>{t('Copy summary', 'ចម្លងសង្ខេប')}</button></div>
    <button className="edit-business" onClick={() => { setForm({ ...draft.business }); setEditing(true); }}><div className="edit-symbol"><Store size={20}/></div><span><strong>{t('Edit business details', 'កែព័ត៌មានអាជីវកម្ម')}</strong><small>{t('Name, activity, location and years', 'ឈ្មោះ ប្រភេទ ទីតាំង និងចំនួនឆ្នាំ')}</small></span><ChevronRight size={18}/></button>
    {editing && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setEditing(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="business-title"><div className="modal-top"><h2 id="business-title">{t('Business details', 'ព័ត៌មានអាជីវកម្ម')}</h2><button className="icon-btn" aria-label="Close" onClick={() => setEditing(false)}><X size={20}/></button></div>
      <form className="entry-form" onSubmit={save}><label>{t('Business name', 'ឈ្មោះអាជីវកម្ម')}<input maxLength={80} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder={t('e.g. My corner shop', 'ឧ. ហាងរបស់ខ្ញុំ')}/></label><label>{t('Business activity', 'ប្រភេទអាជីវកម្ម')}<input maxLength={80} value={form.type} onChange={event => setForm({ ...form, type: event.target.value })} placeholder={t('e.g. Grocery shop', 'ឧ. ហាងលក់ទំនិញ')}/></label><label>{t('Location', 'ទីតាំង')}<input maxLength={100} value={form.location} onChange={event => setForm({ ...form, location: event.target.value })} placeholder={t('City or province', 'រាជធានី ឬខេត្ត')}/></label><label>{t('Years operating', 'ចំនួនឆ្នាំដំណើរការ')}<input type="number" inputMode="decimal" min="0" max="150" step="0.1" value={form.years} onChange={event => setForm({ ...form, years: event.target.value })} placeholder="0"/></label><button type="submit" className="primary-btn full">{t('Save details', 'រក្សាទុកព័ត៌មាន')} <Check size={17}/></button></form></section></div>}
  </div>;
}

function LearnScreen({ language, onReset, onDemo }: { language: Language; onReset: () => void; onDemo: () => void }) {
  const t = (en: string, km: string) => language === 'en' ? en : km;
  const [open, setOpen] = useState(0);
  return <div className="screen-stack"><div className="page-intro"><span className="intro-icon"><BookOpen size={22}/></span><h1>{t('Learn at your pace', 'រៀនតាមល្បឿនរបស់អ្នក')}</h1><p>{t('Practical money lessons for everyday businesses.', 'មេរៀនហិរញ្ញវត្ថុងាយៗសម្រាប់អាជីវកម្មប្រចាំថ្ងៃ។')}</p></div>
    <div className="lesson-hero"><div><span className="mini-label">{t('FINANCIAL BASICS', 'ចំណេះដឹងហិរញ្ញវត្ថុ')}</span><h2>{t('A little knowledge goes a long way.', 'ចំណេះដឹងតិចតួច អាចជួយបានច្រើន។')}</h2><p>{t('Understand the numbers before you talk to a lender.', 'យល់ពីតួលេខមុនពិភាក្សាជាមួយស្ថាប័នហិរញ្ញវត្ថុ។')}</p></div><BookOpen size={60} strokeWidth={1.2}/></div>
    <Heading title={t('Quick lessons', 'មេរៀនខ្លីៗ')} subtitle={t('Tap a topic to read more', 'ចុចលើប្រធានបទដើម្បីអានបន្ថែម')}/>
    <Card className="lesson-list">{lessons.map((lesson, index) => { const Icon = lesson.icon; return <div className="lesson" key={lesson.title[0]}><button aria-expanded={open === index} className="lesson-trigger" onClick={() => setOpen(open === index ? -1 : index)}><span className="lesson-icon"><Icon size={20}/></span><span className="lesson-titles"><strong>{lesson.title[language === 'en' ? 0 : 1]}</strong><small>{lesson.sub[language === 'en' ? 0 : 1]}</small></span><ChevronDown size={19} className={open === index ? 'rotate' : ''}/></button>{open === index && <p className="lesson-body">{lesson.body[language === 'en' ? 0 : 1]}</p>}</div>; })}</Card>
    <Card className="privacy-card"><ShieldCheck size={23}/><div><h2>{t('Your information stays yours', 'ព័ត៌មានរបស់អ្នកជាកម្មសិទ្ធិរបស់អ្នក')}</h2><p>{t('This demo has no accounts, server, lender integration, or automatic document reading. Changes disappear on refresh. Only share the business profile if you choose to.', 'គំរូនេះមិនមានគណនី ម៉ាស៊ីនមេ ការភ្ជាប់ស្ថាប័នហិរញ្ញវត្ថុ ឬការអានឯកសារស្វ័យប្រវត្តិទេ។ ព័ត៌មាននឹងបាត់ពេលផ្ទុកទំព័រឡើងវិញ។ ចែករំលែកប្រវត្តិអាជីវកម្មតែបើអ្នកសម្រេចចិត្ត។')}</p></div></Card>
    <div className="demo-controls"><button onClick={onReset}><ArrowLeft size={15}/>{t('Start with empty data', 'ចាប់ផ្តើមដោយគ្មានទិន្នន័យ')}</button><button onClick={onDemo}>{t('Load fictional example', 'ផ្ទុកទិន្នន័យឧទាហរណ៍')}<ArrowRight size={15}/></button></div>
    <p className="build-footer">SME Ready · {t('Interactive concept prototype', 'គំរូកម្មវិធីអន្តរកម្ម')} · v0.1</p>
  </div>;
}

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [tab, setTab] = useState<Tab>('home');
  const [draft, setDraft] = useState<Draft>(sampleDraft);
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [currency, setCurrency] = useState<Currency>('KHR');
  const [toast, setToast] = useState('');
  const t = (en: string, km: string) => language === 'en' ? en : km;
  const checklist = useMemo(() => getChecklist(draft, evidence), [draft, evidence]);
  const score = readinessScore(checklist);
  const onTab = (next: Tab) => { setTab(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const clearEvidence = () => { for (const file of evidence) URL.revokeObjectURL(file.url); setEvidence([]); };
  const reset = () => { if (!window.confirm(t('Clear this session and start fresh? You cannot undo this.', 'លុបទិន្នន័យក្នុងសម័យនេះ និងចាប់ផ្តើមថ្មីមែនទេ? មិនអាចយកមកវិញបានទេ។'))) return; clearEvidence(); setDraft(emptyDraft()); setTab('home'); setToast(t('Started a new, empty draft.', 'បានចាប់ផ្តើមទិន្នន័យថ្មី។')); };
  const demo = () => { if (!window.confirm(t('Replace this session with fictional example data?', 'ជំនួសទិន្នន័យនេះដោយឧទាហរណ៍មែនទេ?'))) return; clearEvidence(); setDraft(sampleDraft()); setCurrency('KHR'); setTab('home'); setToast(t('Fictional example loaded.', 'បានផ្ទុកទិន្នន័យឧទាហរណ៍។')); };
  const addEntry = (entry: Entry) => { setDraft(previous => ({ ...previous, entries: [entry, ...previous.entries] })); setToast(t('Transaction added.', 'បានបន្ថែមប្រតិបត្តិការ។')); };
  const deleteEntry = (id: string) => { setDraft(previous => ({ ...previous, entries: previous.entries.filter(entry => entry.id !== id) })); setToast(t('Transaction deleted.', 'បានលុបប្រតិបត្តិការ។')); };
  const addFile = (files: FileList) => {
    const added: EvidenceFile[] = [];
    for (const file of Array.from(files)) {
      if (!['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0) continue;
      if (evidence.length + added.length >= 5) break;
      added.push({ id: crypto.randomUUID(), name: file.name, url: URL.createObjectURL(file), mime: file.type });
    }
    if (added.length) { setEvidence(previous => [...previous, ...added]);  }
    setToast(added.length ? t(`${added.length} local file(s) added. No data was uploaded.`, `បានបន្ថែមឯកសារ ${added.length} ក្នុងឧបករណ៍។ មិនបានបង្ហោះទេ។`) : t('Use PNG, JPG, WebP or PDF under 5 MB (maximum five files).', 'សូមប្រើ PNG, JPG, WebP ឬ PDF តិចជាង ៥ MB (អតិបរមា ៥ ឯកសារ)។'));
  };
  const removeFile = (id: string) => { const file = evidence.find(item => item.id === id); if (file) URL.revokeObjectURL(file.url); setEvidence(previous => previous.filter(item => item.id !== id)); };
  const setDocument = (key: DocKey, checked: boolean) => setDraft(previous => ({ ...previous, documents: { ...previous.documents, [key]: checked } }));
  const updateBusiness = (business: Business) => setDraft(previous => ({ ...previous, business }));

  useEffect(() => {
    const backButton = telegramApp()?.BackButton;
    if (!backButton) return;
    const goHome = () => setTab('home');
    if (tab === 'home') backButton.hide(); else { backButton.show(); backButton.onClick(goHome); }
    return () => { if (tab !== 'home') backButton.offClick(goHome); };
  }, [tab]);

  return <div className="app-shell"><div className="desktop-context"><div className="context-logo"><span className="brand-mark" aria-hidden="true"><span className="brand-leaf"/><span className="brand-dot"/></span> SME Ready</div><h1>{t('A clearer path to formal finance.', 'ផ្លូវកាន់តែច្បាស់ទៅកាន់ហិរញ្ញវត្ថុផ្លូវការ។')}</h1><p>{t('An interactive Telegram Mini App concept for Cambodia’s small businesses.', 'គំរូ Telegram Mini App សម្រាប់អាជីវកម្មខ្នាតតូចនៅកម្ពុជា។')}</p><div className="context-foot"><ShieldCheck size={18}/>{t('Prototype · No lender connection', 'គំរូសាកល្បង · មិនភ្ជាប់ជាមួយស្ថាប័នហិរញ្ញវត្ថុ')}</div></div>
    <div className="phone-app"><Header language={language} setLanguage={setLanguage} sample={draft.sample}/><main id="main-content" className="app-content">
      {tab === 'home' && <HomeScreen draft={draft} evidence={evidence} score={score} language={language} currency={currency} setCurrency={setCurrency} onTab={onTab} onReset={reset}/>}
      {tab === 'records' && <RecordsScreen draft={draft} evidence={evidence} language={language} currency={currency} addEntry={addEntry} deleteEntry={deleteEntry} addFile={addFile} removeFile={removeFile}/>}
      {tab === 'readiness' && <ReadinessScreen draft={draft} evidence={evidence} language={language} setDocument={setDocument} onTab={onTab}/>}
      {tab === 'profile' && <ProfileScreen draft={draft} evidence={evidence} language={language} updateBusiness={updateBusiness} onToast={setToast}/>}
      {tab === 'learn' && <LearnScreen language={language} onReset={reset} onDemo={demo}/>}
    </main><nav className="bottom-nav" aria-label={t('Main navigation', 'ម៉ឺនុយមេ')}>
      {tabs.map(item => { const Icon = item.icon; return <button key={item.id} aria-current={tab === item.id ? 'page' : undefined} onClick={() => onTab(item.id)} className={tab === item.id ? 'active' : ''}><Icon size={21} strokeWidth={tab === item.id ? 2.3 : 1.8}/><span>{labels[item.id][language === 'en' ? 0 : 1]}</span></button>; })}
    </nav>{toast && <div className="toast" role="status"><CheckCircle2 size={16}/><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15}/></button></div>}</div>
    <article className="print-profile"><pre>{profileText(draft, evidence, language)}</pre></article>
  </div>;
}
