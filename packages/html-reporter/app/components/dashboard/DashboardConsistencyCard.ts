import htm from 'htm';
import { h } from 'preact';

import type { ReportScenarioRef } from '../../../src/cli/ReportData.js';
import { getBrowserTag, outcomeClass, outcomeDisplayName, outcomeIcon, scenarioUrl } from '../../utils/index.js';
import { BrowserBadge } from '../common/BrowserBadge.js';
import { HistoryDots } from '../common/HistoryDots.js';

const html = htm.bind(h);

interface ConsistencyItem extends ReportScenarioRef {
    kind: string;
    lastOutcome: string;
    history?: Array<string | { outcome: string; run: string; retriedAndPassed?: boolean }>;
    labels?: string[];
}

interface DashboardConsistencyCardProps {
    items: ConsistencyItem[];
    hasItems: boolean;
    onNavigate: (path: string) => void;
    getHistory: (t: ReportScenarioRef) => Array<string | { outcome: string; run: string; retriedAndPassed?: boolean }>;
}

type HistoryEntry = string | { outcome: string; run: string; retriedAndPassed?: boolean };

function buildHistoryEntries(history: HistoryEntry[], labels: string[] | undefined): Array<{ outcome: string; retriedAndPassed?: boolean; label: string }> {
    return history.map((entry, i) => {
        const outcome = typeof entry === 'string' ? entry : entry.outcome;
        const retriedAndPassed = typeof entry === 'object' ? entry.retriedAndPassed : undefined;
        const label = labels ? labels[i] : (typeof entry === 'object' ? entry.run : '');
        return {
            outcome,
            retriedAndPassed,
            label: outcomeDisplayName(retriedAndPassed ? 'RETRIED_SUCCESS' : outcome) + (label ? ' (' + label + ')' : ''),
        };
    });
}

function kindColor(kind: string): string {
    if (kind === 'degraded') return 'var(--color-failed)';
    if (kind === 'recovered') return 'var(--color-passed)';
    return 'var(--color-pending)';
}

function ConsistencyItemRow({ item, onNavigate, getHistory }: { item: ConsistencyItem; onNavigate: (path: string) => void; getHistory: DashboardConsistencyCardProps['getHistory'] }): ReturnType<typeof html> {
    const history = item.history || getHistory(item);
    const historyEntries = buildHistoryEntries(history, item.labels);

    return html`
        <div class="status-item status-item--rich clickable" onClick=${() => onNavigate(scenarioUrl(item))}>
          <div class="status-item-main">
            <span class="status-icon status-icon--${outcomeClass(item.lastOutcome)}">${outcomeIcon(item.lastOutcome)}</span>
            <span class="status-item-name">${item.name}</span>
          </div>
          <div class="status-item-history-line">
            <span class="status-item-kind" style="color:${kindColor(item.kind)}">${item.kind.toUpperCase()}</span>
            <${HistoryDots} entries=${historyEntries} />
          </div>
          ${getBrowserTag(item) ? html`
            <div class="status-item-tags scroll-x-hidden">
              <${BrowserBadge} scenario=${item} />
            </div>
          ` : null}
        </div>
    `;
}

export function DashboardConsistencyCard({ items, hasItems, onNavigate, getHistory }: DashboardConsistencyCardProps): ReturnType<typeof html> {
    return html`
        <div class="card dashboard-status-card" data-testid="dashboard-consistency-card">
          <div class="card-header">
            <span class="status-card-title">Consistency</span>
            ${hasItems ? html`<a class="view-all-link" onClick=${() => onNavigate('/consistency')}>View all →</a>` : null}
          </div>
          ${items.length === 0
                    ? html`<div class="status-empty status-empty--ok"><span class="status-chip">✓</span> All tests consistent</div>`
                    : items.map(t => html`<${ConsistencyItemRow} item=${t} onNavigate=${onNavigate} getHistory=${getHistory} />`)
            }
        </div>
    `;
}
