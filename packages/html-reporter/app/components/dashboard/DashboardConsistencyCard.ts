import htm from 'htm';
import { h } from 'preact';

import type { ReportScenarioRef } from '../../../src/cli/ReportData';
import { browserBadgeClass, getBrowserTag, outcomeClass, outcomeDisplayName, outcomeIcon, scenarioUrl } from '../../utils';

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

export function DashboardConsistencyCard({ items, hasItems, onNavigate, getHistory }: DashboardConsistencyCardProps): ReturnType<typeof html> {
    return html`
        <div class="card dashboard-status-card" data-testid="dashboard-consistency-card">
          <div class="card-header">
            <span class="status-card-title">Consistency</span>
            ${hasItems ? html`<a class="view-all-link" onClick=${() => onNavigate('/consistency')}>View all →</a>` : null}
          </div>
          ${items.length === 0
                    ? html`<div class="status-empty status-empty--ok"><span class="status-chip">✓</span> All tests consistent</div>`
                    : items.map(t => html`
                <div class="status-item status-item--rich clickable" onClick=${() => onNavigate(scenarioUrl(t))}>
                  <div class="status-item-main">
                    <span class="status-icon status-icon--${outcomeClass(t.lastOutcome)}">${outcomeIcon(t.lastOutcome)}</span>
                    <span class="status-item-name">${t.name}</span>
                  </div>
                  <div class="status-item-history-line">
                    <span class="status-item-kind" style="color:${kindColor(t.kind)}">${t.kind.toUpperCase()}</span>
                    <${HistoryDotStrip} history=${t.history || getHistory(t)} labels=${t.labels} />
                  </div>
                  ${getBrowserTag(t) ? html`
                    <div class="status-item-tags">
                      <span class="badge ${browserBadgeClass(getBrowserTag(t)!)}">${getBrowserTag(t)}</span>
                    </div>
                  ` : null}
                </div>
            `)
            }
        </div>
    `;
}

function kindColor(kind: string): string {
    if (kind === 'degraded') return 'var(--color-failed)';
    if (kind === 'recovered') return 'var(--color-passed)';
    return 'var(--color-pending)';
}

function HistoryDotStrip({ history, labels }: { history: Array<string | { outcome: string; run: string; retriedAndPassed?: boolean }>; labels?: string[] }): ReturnType<typeof html> {
    return html`
        <div class="status-item-history">
          ${history.map((h, i) => {
                const outcome = typeof h === 'string' ? h : (h.retriedAndPassed ? 'RETRIED_SUCCESS' : h.outcome);
                const label = labels ? labels[i] : (typeof h === 'object' ? h.run : '');
                return html`<span class="history-dot history-dot--${outcomeClass(outcome)}" title=${outcomeDisplayName(outcome) + (label ? ' (' + label + ')' : '')}></span>`;
            })}
        </div>
    `;
}
