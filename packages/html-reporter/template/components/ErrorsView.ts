import htm from 'htm';
import { h } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';

import type { ReportHistoryEntry, ReportScenario } from '../../src/ReportData';
import { ROW_HEIGHTS } from '../config/layout';
import { formatRunLabel } from '../utils';
import { icons } from './icons';
import { GroupedVirtualList } from './layout/GroupedVirtualList';
import { ErrorRow } from './rows/ErrorRow';
import { RunSelector } from './RunSelector';

const html = htm.bind(h);

interface ErrorsViewProps {
    scenarios: ReportScenario[];
    history: ReportHistoryEntry[];
    specDirectory?: string;
    onNavigate: (path: string) => void;
    route: string;
}

interface ErrorRenderItem {
    type: 'header' | 'scenario';
    icon?: string;
    name?: string;
    count?: number;
    scenario?: ReportScenario;
    duplicateCount?: number;
    category?: string;
}

export function ErrorsView({ scenarios: allScenarios, history, specDirectory, onNavigate, route }: ErrorsViewProps): ReturnType<typeof html> {
    const errorRunParameters = (route && route.includes('?')) ? new URLSearchParams(route.split('?')[1]) : null;
    const errorRunString = errorRunParameters ? errorRunParameters.get('run') : null;
    const errorRunIndex = useMemo(() => {
        if (errorRunString === null) return null;
        const byTs = history.findIndex(r => r.timestamp === errorRunString);
        if (byTs >= 0) return byTs;
        const parsed = parseInt(errorRunString, 10);
        return isNaN(parsed) ? null : parsed;
    }, [errorRunString]);
    const errorIsHistorical = errorRunIndex !== null && errorRunIndex !== history.length - 1;
    const errorHistoricalRun = errorIsHistorical ? history[errorRunIndex] : null;

    const errorActiveRunTs = errorRunIndex !== null && history[errorRunIndex] ? history[errorRunIndex].timestamp : history[history.length - 1]?.timestamp || null;
    const onErrorRunChange = (e: Event) => {
        const ts = (e.target as HTMLSelectElement).value;
        const index = history.findIndex(r => r.timestamp === ts);
        const isLatest = index === history.length - 1;
        onNavigate(isLatest ? '/errors' : '/errors?run=' + ts);
    };
    const errorShowLatest = () => onNavigate('/errors');

    const errorScenarios = allScenarios.filter(s => s.error || s.outcome === 'FAILURE' || s.outcome === 'ERROR' || s.outcome === 'COMPROMISED');

    function classifyError(error: { name?: string; message?: string }): string {
        const name = (error.name || '').toLowerCase();
        const message = (error.message || '').toLowerCase();
        if (name.includes('compromised')) return 'Compromised Tests';
        if (name.includes('assert') || name.includes('assertion')) return 'Assertion Errors';
        if (message.includes('timed out') || message.includes('timeout')) return 'Timeout Errors';
        return 'Runtime Errors';
    }

    const categories: Record<string, ReportScenario[]> = {};
    for (const s of errorScenarios) {
        const cat = classifyError(s.error || { name: s.outcome, message: '' });
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(s);
    }

    const categoryOrder = Object.entries(categories).map(([name, scenarios]) => {
        return { name, scenarios: scenarios as ReportScenario[] };
    }).sort((a, b) => b.scenarios.length - a.scenarios.length);

    const categoryColors: Record<string, string> = { 'Assertion Errors': 'var(--color-failed)', 'Compromised Tests': 'var(--color-compromised)', 'Timeout Errors': 'var(--color-pending)', 'Runtime Errors': 'var(--color-failed)' };
    const categoryIcons: Record<string, string> = { 'Assertion Errors': '≠', 'Compromised Tests': '⚠', 'Timeout Errors': '⏱', 'Runtime Errors': '✗' };

    const summaryCards = categoryOrder.map(cat => ({
        title: cat.name,
        value: String(cat.scenarios.length),
        color: categoryColors[cat.name] || 'var(--color-failed)',
        subtitle: cat.scenarios.length === 1 ? '1 test' : cat.scenarios.length + ' tests',
    }));

    const renderItems: ErrorRenderItem[] = useMemo(() => {
        const items: ErrorRenderItem[] = [];
        for (const cat of categoryOrder) {
            items.push({ type: 'header', icon: categoryIcons[cat.name] || '✗', name: cat.name, count: cat.scenarios.length, category: cat.name });
            // Group by error message
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
    }, [categoryOrder]);

    // Items for the grouped virtual list (only scenario items; headers are handled by groupBy)
    const scenarioItems = useMemo(() => renderItems.filter(item => item.type === 'scenario'), [renderItems]);

    const groupByFunction = useCallback((item: ErrorRenderItem) => {
        return item.category || 'Errors';
    }, []);

    const renderItem = useCallback((item: ErrorRenderItem) => {
        return html`<${ErrorRow} scenario=${item.scenario} duplicateCount=${item.duplicateCount}
            specDirectory=${specDirectory} onNavigate=${onNavigate} />`;
    }, [specDirectory, onNavigate]);

    const renderGroupHeader = useCallback((category: string) => {
        const icon = categoryIcons[category] || '✗';
        const cat = categoryOrder.find(c => c.name === category);
        const count = cat ? cat.scenarios.length : 0;
        return html`
          <span>${icon}</span>
          <span>${category}</span>
          <span style="font-size:var(--font-xs);color:var(--text-disabled);font-weight:400">(${count})</span>
        `;
    }, [categoryOrder]);

    const renderStickyContent = useCallback((element: HTMLDivElement, item: { type: string; [key: string]: unknown }) => {
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.gap = 'var(--space-sm)';
        element.innerHTML = '';
        const iconSpan = document.createElement('span');
        iconSpan.textContent = (item.icon as string) || '✗';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = (item.name as string) || '';
        const countSpan = document.createElement('span');
        countSpan.textContent = '(' + (item.count || 0) + ')';
        countSpan.style.cssText = 'font-size:var(--font-xs);color:var(--text-disabled);font-weight:400';
        element.appendChild(iconSpan);
        element.appendChild(nameSpan);
        element.appendChild(countSpan);
    }, []);

    if (errorScenarios.length === 0) {
        return html`
      <div class="placeholder-view">
        ${icons.errors}
        <h2>No Errors</h2>
        <p>All tests passed without errors.</p>
      </div>
    `;
    }

    return html`
    <div>
      ${errorHistoricalRun ? html`
        <div class="historical-banner">
          <span>Viewing errors from: <strong>${formatRunLabel(errorHistoricalRun.label, errorHistoricalRun.timestamp)}</strong></span>
          <a onClick=${errorShowLatest} class="link-underline">show latest</a>
        </div>
      ` : null}

      <${RunSelector} activeTimestamp=${errorActiveRunTs} history=${history} onRunChange=${onErrorRunChange} />

      <div class="kpi-row mb-md stat-grid">
        ${summaryCards.map(card => html`
          <div class="kpi-card" tabindex="0" aria-label="${card.title}: ${card.value}">
            <span class="kpi-label">${card.title}</span>
            <span class="kpi-value" style="color:${card.color}">${card.value}</span>
            <span class="kpi-subtitle">${card.subtitle}</span>
          </div>
        `)}
      </div>
      <div class="card pb-0">
        <div class="text-muted mb-md">
          Showing ${errorScenarios.length} ${errorScenarios.length === 1 ? 'error' : 'errors'}
        </div>
        <${GroupedVirtualList}
            items=${scenarioItems}
            groupBy=${groupByFunction}
            rowHeight=${ROW_HEIGHTS.error}
            renderItem=${renderItem}
            renderGroupHeader=${renderGroupHeader}
            renderStickyContent=${renderStickyContent}
            id="vs-errors-sticky"
        />
      </div>
    </div>
  `;
}
