import htm from 'htm';
import { h } from 'preact';

import type { ReportScenario } from '../../../src/cli/ReportData.js';
import { formatDuration, scenarioUrl } from '../../utils/index.js';
import { link } from '../../utils/link.js';

const html = htm.bind(h);

interface DashboardSlowestCardProps {
    scenarios: ReportScenario[];
    onNavigate: (path: string) => void;
}

export function DashboardSlowestCard({ scenarios, onNavigate }: DashboardSlowestCardProps): ReturnType<typeof html> {
    return html`
        <div class="card dashboard-status-card" data-testid="dashboard-slowest-card">
          <div class="card-header">
            <h2 class="status-card-title">Slowest Tests</h2>
            <a class="view-all-link" href="#${link({ view: 'tests', sort: 'duration' })}" onClick=${(e: Event) => { e.preventDefault(); onNavigate(link({ view: 'tests', sort: 'duration' })); }}>View all →</a>
          </div>
          ${scenarios.map(s => html`
            <a class="status-item" href="#${scenarioUrl(s)}" onClick=${(e: Event) => { e.preventDefault(); onNavigate(scenarioUrl(s)); }}>
              <span class="status-icon" style="color:var(--color-pending)">⏱</span>
              <span class="status-item-name">${s.name}</span>
              <span class="status-item-meta">${formatDuration(s.duration)}</span>
            </a>
          `)}
        </div>
    `;
}
