import htm from 'htm';
import { h } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';

import type { ReportHistoryEntry, ReportScenario } from '../../../src/cli/ReportData';
import { ROW_HEIGHTS } from '../../config/layout';
import { useRunSelection } from '../../hooks/useRunSelection';
import { icons } from '../common/icons';
import { KpiCard } from '../common/KpiCard';
import { GroupedVirtualList } from '../common/layout/GroupedVirtualList';
import { ResultCount } from '../common/ResultCount';
import { RunSelector } from '../common/RunSelector';
import { ErrorRow } from './ErrorRow';

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
    const { runIndex: errorRunIndex, isHistorical: errorIsHistorical, activeTimestamp: errorActiveRunTs, onRunChange: onErrorRunChange } = useRunSelection(route, history, '/errors', onNavigate);

    const errorScenarios = useMemo(() => {
        if (errorRunIndex === null || errorRunIndex === history.length - 1) {
            // Latest run: filter by current outcome/error
            return allScenarios.filter(s => s.error || s.outcome === 'FAILURE' || s.outcome === 'ERROR' || s.outcome === 'COMPROMISED');
        }
        // Historical run: find scenarios that failed in that specific run via executionHistory
        const runTimestamp = history[errorRunIndex]?.timestamp;
        if (!runTimestamp) return [];
        const result: ReportScenario[] = [];
        for (const s of allScenarios) {
            if (!s.executionHistory) continue;
            const entry = s.executionHistory.find(e => e.timestamp === runTimestamp);
            if (!entry) continue;
            if (entry.outcome === 'FAILURE' || entry.outcome === 'ERROR' || entry.outcome === 'COMPROMISED' || entry.error) {
                // Construct a minimal scenario from the historical entry for display in ErrorRow
                result.push({
                    ...s,
                    outcome: entry.outcome,
                    duration: entry.duration ?? s.duration,
                    error: entry.error || undefined,
                } as ReportScenario);
            }
        }
        return result;
    }, [allScenarios, errorRunIndex, history]);

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

    const renderStickyContent = useCallback((element: HTMLDivElement, header: { type: 'header'; category: string; icon: string; name: string; count: number }) => {
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.gap = 'var(--space-sm)';
        element.innerHTML = '';
        const iconSpan = document.createElement('span');
        iconSpan.textContent = header.icon;
        const nameSpan = document.createElement('span');
        nameSpan.textContent = header.name;
        const countSpan = document.createElement('span');
        countSpan.textContent = '(' + header.count + ')';
        countSpan.style.cssText = 'font-size:var(--font-xs);color:var(--text-disabled);font-weight:400';
        element.appendChild(iconSpan);
        element.appendChild(nameSpan);
        element.appendChild(countSpan);
    }, []);

    const groupHeaderData = useCallback((category: string) => {
        const cat = categoryOrder.find(c => c.name === category);
        return {
            icon: categoryIcons[category] || '✗',
            name: category,
            count: cat ? cat.scenarios.length : 0,
        };
    }, [categoryOrder]);

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
    <div class="flex-fill-view">
      ${history.length > 1 ? html`<${RunSelector} activeTimestamp=${errorActiveRunTs} history=${history} onRunChange=${onErrorRunChange} isHistorical=${errorIsHistorical} showLatestHref="#/errors" />` : null}

      <div class="kpi-row mb-md stat-grid">
        ${summaryCards.map(card => html`
          <${KpiCard} label=${card.title} value=${card.value} ariaLabel="${card.title}: ${card.value}" valueColor=${card.color} subtitle=${card.subtitle} />
        `)}
      </div>
      <div class="card pb-0">
        <${ResultCount} showing=${errorScenarios.length} label=${errorScenarios.length === 1 ? 'error' : 'errors'} />
        <${GroupedVirtualList}
            items=${scenarioItems}
            groupBy=${groupByFunction}
            rowHeight=${ROW_HEIGHTS.error}
            renderItem=${renderItem}
            renderGroupHeader=${renderGroupHeader}
            groupHeaderData=${groupHeaderData}
            renderStickyContent=${renderStickyContent}
            id="vs-errors-sticky"
        />
      </div>
    </div>
  `;
}
