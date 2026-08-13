import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry } from '../../../src/cli/reporting/ReportData.js';
import { TrendChart } from '../common/charts/TrendChart.js';
import { ViewTopbar } from '../common/ViewTopbar.js';
import { TestRunRow } from './TestRunRow.js';

const html = htm.bind(h);

interface TestRunsViewProps {
    history: ReportHistoryEntry[];
    onNavigate: (path: string) => void;
    onOpenSidebar?: () => void;
}

export function TestRunsView({ history, onNavigate, onOpenSidebar }: TestRunsViewProps): ReturnType<typeof html> {
    const openSidebar = onOpenSidebar || (() => {});
    const runs: ReportHistoryEntry[] = [...history].reverse();
    return html`
    <div>
      <${ViewTopbar} title="Test Runs" onOpenSidebar=${openSidebar} />
      <div class="card mb-md" style="overflow:hidden">
        <div class="card-title">Trend (All ${history.length} runs)</div>
        <${TrendChart} history=${history} onNavigate=${onNavigate} />
      </div>
      <div class="card">
        <div class="card-title">Test Run History</div>
        <div class="scenario-list">
          ${runs.map((run: ReportHistoryEntry) => html`
            <${TestRunRow} run=${run} onNavigate=${onNavigate} />
          `)}
        </div>
      </div>
    </div>
  `;
}
