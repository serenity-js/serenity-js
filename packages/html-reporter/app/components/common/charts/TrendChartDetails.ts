import htm from 'htm';
import type { Ref } from 'preact';
import { h } from 'preact';

import type { SelectedRun } from './TrendChart';

const html = htm.bind(h);

export interface TrendChartDetailsProps {
    selectedRun: SelectedRun;
    panelRef: Ref<HTMLDivElement | null>;
    onClose: () => void;
    onNavigate: () => void;
}

export function TrendChartDetails({ selectedRun, panelRef, onClose, onNavigate }: TrendChartDetailsProps): ReturnType<typeof html> {
    const total = selectedRun.metrics.passed + selectedRun.metrics.failed + selectedRun.metrics.skipped;

    return html`
        <div class="run-details-panel" ref=${panelRef} data-testid="run-details-panel">
          <div class="run-details-header">
            <div class="run-details-title">${selectedRun.label}</div>
            <button class="run-details-close" onClick=${onClose} aria-label="Close details panel">✕</button>
          </div>
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
          <div class="run-details-durations">
            <div class="run-details-duration-row">
              <span class="run-details-duration-label">Total duration</span>
              <span class="run-details-duration-value">${selectedRun.metrics.total}</span>
            </div>
            <div class="run-details-duration-row">
              <span class="run-details-duration-label">Average</span>
              <span class="run-details-duration-value">${selectedRun.metrics.average}</span>
            </div>
            <div class="run-details-duration-row">
              <span class="run-details-duration-label">Slowest</span>
              <span class="run-details-duration-value">${selectedRun.metrics.slowest}</span>
            </div>
            <div class="run-details-duration-row">
              <span class="run-details-duration-label">Fastest</span>
              <span class="run-details-duration-value">${selectedRun.metrics.fastest}</span>
            </div>
          </div>
          <button class="run-details-cta" onClick=${onNavigate} data-testid="run-details-cta">
            Open run details →
          </button>
        </div>
    `;
}
