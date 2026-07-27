import type { ReportScenario } from '../../../src/cli/ReportData.js';
import type { ErrorCategorySummary } from './ErrorKpiCards.js';

export interface ErrorCategory {
    name: string;
    scenarios: ReportScenario[];
}

export interface ErrorRenderItem {
    type: 'header' | 'scenario';
    icon?: string;
    name?: string;
    count?: number;
    scenario?: ReportScenario;
    duplicateCount?: number;
    category?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Assertion Errors': 'var(--color-failed)',
    'Compromised Tests': 'var(--color-compromised)',
    'Timeout Errors': 'var(--color-pending)',
    'Runtime Errors': 'var(--color-failed)',
};

export const CATEGORY_ICONS: Record<string, string> = {
    'Assertion Errors': '≠',
    'Compromised Tests': '⚠',
    'Timeout Errors': '⏱',
    'Runtime Errors': '✗',
};

function classifyError(error: { name?: string; message?: string }): string {
    const name = (error.name || '').toLowerCase();
    const message = (error.message || '').toLowerCase();
    if (name.includes('compromised')) return 'Compromised Tests';
    if (name.includes('assert') || name.includes('assertion')) return 'Assertion Errors';
    if (message.includes('timed out') || message.includes('timeout')) return 'Timeout Errors';
    return 'Runtime Errors';
}

export function categoriseErrors(scenarios: ReportScenario[]): ErrorCategory[] {
    const categories: Record<string, ReportScenario[]> = {};
    for (const s of scenarios) {
        const cat = classifyError(s.error || { name: s.outcome, message: '' });
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(s);
    }
    return Object.entries(categories)
        .map(([name, items]) => ({ name, scenarios: items }))
        .sort((a, b) => b.scenarios.length - a.scenarios.length);
}

export function buildSummaryCards(categoryOrder: ErrorCategory[]): ErrorCategorySummary[] {
    return categoryOrder.map(cat => ({
        title: cat.name,
        value: String(cat.scenarios.length),
        color: CATEGORY_COLORS[cat.name] || 'var(--color-failed)',
        subtitle: cat.scenarios.length === 1 ? '1 test' : cat.scenarios.length + ' tests',
    }));
}

export function buildRenderItems(categoryOrder: ErrorCategory[]): ErrorRenderItem[] {
    const items: ErrorRenderItem[] = [];
    for (const cat of categoryOrder) {
        items.push({ type: 'header', icon: CATEGORY_ICONS[cat.name] || '✗', name: cat.name, count: cat.scenarios.length, category: cat.name });
        const grouped = new Map<string, ReportScenario[]>();
        for (const s of cat.scenarios) {
            const key = s.error ? s.error.message : s.outcome;
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key)!.push(s);
        }
        for (const [, scenarios] of grouped) {
            items.push({ type: 'scenario', scenario: scenarios[0], duplicateCount: scenarios.length, category: cat.name });
        }
    }
    return items;
}
