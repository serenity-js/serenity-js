import htm from 'htm';
import { h } from 'preact';

import type { ReportScenario } from '../../../src/cli/ReportData';
import { formatDuration, scenarioUrl } from '../../utils';

const html = htm.bind(h);

interface DashboardSlowestCardProps {
    scenarios: ReportScenario[];
    onNavigate: (path: string) => void;
}

export function DashboardSlowestCard({ scenarios, onNavigate }: DashboardSlowestCardProps): ReturnType<typeof html> {
    return html`
        <div class="card dashboard-status-card">
          <div class="card-header">
            <span class="status-card-title">Slowest Tests</span>
            <a class="view-all-link" onClick=${() => onNavigate('/tests?sort=duration')}>View all →</a>
          </div>
          ${scenarios.map(s => html`
            <div class="status-item clickable" onClick=${() => onNavigate(scenarioUrl(s))}>
              <span class="status-icon" style="color:var(--color-pending)">⏱</span>
              <span class="status-item-name">${s.name}</span>
              <span class="status-item-meta">${formatDuration(s.duration)}</span>
            </div>
          `)}
        </div>
    `;
}
