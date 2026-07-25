import htm from 'htm';
import type { Ref } from 'preact';
import { h } from 'preact';

import { formatDuration, formatTimestamp } from '../../../utils';
import type { SelectedRun } from './TrendChart';

const html = htm.bind(h);

export interface TrendChartDetailsProps {
    selectedRun: SelectedRun;
    panelRef: Ref<HTMLDivElement | null>;
    onClose: () => void;
    onNavigate: () => void;
}

const OUTCOME_ICONS: Record<string, string> = {
    passed: '✅',
    failed: '❌',
    incomplete: '⚠️',
};

function moduleScenarioCount(m: { outcomes?: { passed: number; failed: number; pending: number; skipped: number; compromised: number; error: number } }): number {
    if (!m.outcomes) return 0;
    return Object.values(m.outcomes).reduce((a, b) => a + b, 0);
}

function moduleDuration(m: { startedAt: string; finishedAt?: string }): string {
    if (!m.finishedAt) return '—';
    const ms = new Date(m.finishedAt).getTime() - new Date(m.startedAt).getTime();
    return formatDuration(ms);
}

function moduleFailedCount(m: { outcomes?: { failed: number; error: number; compromised: number } }): number {
    if (!m.outcomes) return 0;
    return (m.outcomes.failed || 0) + (m.outcomes.error || 0) + (m.outcomes.compromised || 0);
}

function moduleSkippedCount(m: { outcomes?: { pending: number; skipped: number } }): number {
    if (!m.outcomes) return 0;
    return (m.outcomes.pending || 0) + (m.outcomes.skipped || 0);
}

export function TrendChartDetails({ selectedRun, panelRef, onClose, onNavigate }: TrendChartDetailsProps): ReturnType<typeof html> {
    const total = selectedRun.metrics.passed + selectedRun.metrics.failed + selectedRun.metrics.skipped;
    const modules = selectedRun.modules || [];
    const hasModules = modules.length > 1;

    return html`
        <div class="run-details-panel" ref=${panelRef} data-testid="run-details-panel">
          <div class="run-details-header">
            <div class="run-details-title">${selectedRun.label}</div>
            <button class="run-details-close" onClick=${onClose} aria-label="Close details panel">✕</button>
          </div>

          <div class="run-details-body">
            ${hasModules && html`
              <div class="run-details-table-wrap">
                <table class="run-details-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Outcome</th>
                      <th>Tests</th>
                      <th>Passed</th>
                      <th>Failed</th>
                      <th>Skipped</th>
                      <th>Started</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${modules.map(m => html`
                      <tr class="run-details-table-row run-details-table-row--${m.outcome || 'passed'}">
                        <td class="run-details-table-module">${m.moduleId}</td>
                        <td class="run-details-table-outcome">${OUTCOME_ICONS[m.outcome || 'passed']} ${m.outcome || 'passed'}</td>
                        <td>${m.outcome === 'incomplete' ? '—' : moduleScenarioCount(m)}</td>
                        <td>${m.outcome === 'incomplete' ? '—' : (m.outcomes?.passed || 0)}</td>
                        <td>${m.outcome === 'incomplete' ? '—' : moduleFailedCount(m)}</td>
                        <td>${m.outcome === 'incomplete' ? '—' : moduleSkippedCount(m)}</td>
                        <td>${formatTimestamp(m.startedAt)}</td>
                        <td>${moduleDuration(m)}</td>
                      </tr>
                    `)}
                  </tbody>
                  <tfoot>
                    <tr class="run-details-table-totals">
                      <td><strong>Total</strong></td>
                      <td></td>
                      <td><strong>${total}</strong></td>
                      <td><strong>${selectedRun.metrics.passed}</strong></td>
                      <td><strong>${selectedRun.metrics.failed}</strong></td>
                      <td><strong>${selectedRun.metrics.skipped}</strong></td>
                      <td></td>
                      <td><strong>${selectedRun.metrics.total}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            `}

            ${!hasModules && html`
              <div class="run-details-metrics">
                <div class="run-details-metric">
                  <span class="run-details-metric-value">${total}</span>
                  <span class="run-details-metric-label">Total</span>
                </div>
                <div class="run-details-metric">
                  <span class="run-details-metric-value" style="color:var(--color-passed)">${selectedRun.metrics.passed}</span>
                  <span class="run-details-metric-label">Passed</span>
                </div>
                <div class="run-details-metric">
                  <span class="run-details-metric-value" style="color:var(--color-failed)">${selectedRun.metrics.failed}</span>
                  <span class="run-details-metric-label">Failed</span>
                </div>
                <div class="run-details-metric">
                  <span class="run-details-metric-value" style="color:var(--color-skipped)">${selectedRun.metrics.skipped}</span>
                  <span class="run-details-metric-label">Skipped</span>
                </div>
              </div>
            `}

            ${total > 0 && html`
              <div class="run-details-durations">
                <div class="run-details-duration-row">
                  <span class="run-details-duration-label">Slowest</span>
                  <span class="run-details-duration-value">${selectedRun.metrics.slowest}</span>
                </div>
                <div class="run-details-duration-row">
                  <span class="run-details-duration-label">Fastest</span>
                  <span class="run-details-duration-value">${selectedRun.metrics.fastest}</span>
                </div>
                <div class="run-details-duration-row">
                  <span class="run-details-duration-label">Average</span>
                  <span class="run-details-duration-value">${selectedRun.metrics.average}</span>
                </div>
              </div>
            `}
          </div>

          <button class="run-details-cta" onClick=${onNavigate} data-testid="run-details-cta">
            Show test scenarios →
          </button>
        </div>
    `;
}
