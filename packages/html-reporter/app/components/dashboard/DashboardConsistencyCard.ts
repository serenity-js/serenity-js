import htm from 'htm';
import { h } from 'preact';

import type { ReportScenarioRef } from '../../../src/cli/ReportData';
import { getBrowserTag, outcomeClass, outcomeDisplayName, outcomeIcon, scenarioUrl } from '../../utils';
import { BrowserBadge } from '../common/BrowserBadge';
import { HistoryDots } from '../common/HistoryDots';

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
                    : items.map(t => {
                        const history = t.history || getHistory(t);
                        const historyEntries = history.map((entry, i) => {
                            const outcome = typeof entry === 'string' ? entry : entry.outcome;
                            const retriedAndPassed = typeof entry === 'object' ? entry.retriedAndPassed : undefined;
                            const label = t.labels ? t.labels[i] : (typeof entry === 'object' ? entry.run : '');
                            return {
                                outcome,
                                retriedAndPassed,
                                label: outcomeDisplayName(retriedAndPassed ? 'RETRIED_SUCCESS' : outcome) + (label ? ' (' + label + ')' : ''),
                            };
                        });

                        return html`
                <div class="status-item status-item--rich clickable" onClick=${() => onNavigate(scenarioUrl(t))}>
                  <div class="status-item-main">
                    <span class="status-icon status-icon--${outcomeClass(t.lastOutcome)}">${outcomeIcon(t.lastOutcome)}</span>
                    <span class="status-item-name">${t.name}</span>
                  </div>
                  <div class="status-item-history-line">
                    <span class="status-item-kind" style="color:${kindColor(t.kind)}">${t.kind.toUpperCase()}</span>
                    <${HistoryDots} entries=${historyEntries} />
                  </div>
                  ${getBrowserTag(t) ? html`
                    <div class="status-item-tags scroll-x-hidden">
                      <${BrowserBadge} scenario=${t} />
                    </div>
                  ` : null}
                </div>
            `;
                    })
            }
        </div>
    `;
}

function kindColor(kind: string): string {
    if (kind === 'degraded') return 'var(--color-failed)';
    if (kind === 'recovered') return 'var(--color-passed)';
    return 'var(--color-pending)';
}
