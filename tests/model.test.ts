import { describe, expect, it } from 'vitest';
import { emptyDraft, getChecklist, money, readinessScore, sampleDraft, totals } from '../src/model';

describe('illustrative preparation model', () => {
  it('starts at zero and a complete checklist totals 100', () => {
    expect(readinessScore(getChecklist(emptyDraft(), []))).toBe(0);
    const draft = sampleDraft();
    draft.documents.bankHistory = true;
    draft.documents.registration = true;
    expect(readinessScore(getChecklist(draft, [{ id: '1', name: 'cashbook.png', url: 'blob:demo', mime: 'image/png' }]))).toBe(100);
  });
  it('example is clearly partial; deleting a record decreases the score', () => {
    const draft = sampleDraft();
    expect(readinessScore(getChecklist(draft, []))).toBe(70);
    draft.entries = draft.entries.filter(entry => entry.id !== 'demo-income-1');
    expect(readinessScore(getChecklist(draft, []))).toBe(50);
  });
  it('never adds money of different currencies or months together', () => {
    const draft = sampleDraft();
    draft.entries.push({ id: 'usd', kind: 'income', amount: 10, currency: 'USD', date: '2020-01-01', category: 'Sale', note: '' });
    const month = draft.entries[0].date.slice(0, 7);
    expect(totals(draft.entries, 'KHR', month)).toEqual({ income: 1350000, expense: 400000, difference: 950000 });
    expect(totals(draft.entries, 'USD', month).income).toBe(0);
  });
  it('formats signed values without converting currencies', () => {
    expect(money(-20, 'USD', 'en')).toBe('−$20.00');
  });
});
