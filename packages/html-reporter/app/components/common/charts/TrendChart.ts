import { Chart } from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import htm from 'htm';
import { h } from 'preact';

Chart.register(zoomPlugin);
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import type { ReportHistoryEntry } from '../../../../src/cli/ReportData';
import { abbreviateRunLabels, formatDuration, formatRunLabel, formatTimestamp } from '../../../utils';
import { computeRunMetrics } from '../../../utils/computeRunMetrics';
import { buildTrendDatasets, buildTrendOptions } from './trendChartConfig';

const html = htm.bind(h);

export interface SelectedRun {
    runId: string;
    index: number;
    label: string;
    timestamp: string;
    metrics: {
        passed: number;
        failed: number;
        skipped: number;
        fastest: string;
        slowest: string;
        average: string;
        total: string;
    };
}

export interface TrendChartProps {
    history: ReportHistoryEntry[];
    onNavigate: (path: string) => void;
}

export function TrendChart({ history, onNavigate }: TrendChartProps): ReturnType<typeof html> | null {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const [chartTheme, setChartTheme] = useState(() => localStorage.getItem('serenity-theme') || 'light');
    const [selectedRun, setSelectedRun] = useState<SelectedRun | null>(null);
    const [canPanLeft, setCanPanLeft] = useState(false);
    const [canPanRight, setCanPanRight] = useState(false);

    const clearSelection = useCallback(() => {
        setSelectedRun(null);
        if (chartRef.current) {
            chartRef.current.setActiveElements([]);
            chartRef.current.update('none');
        }
    }, []);

    // Theme observer
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const t = document.documentElement.getAttribute('data-theme') || 'light';
            setChartTheme(t);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        return () => { observer.disconnect(); };
    }, []);

    // Dismiss on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedRun) {
                clearSelection();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedRun, clearSelection]);

    // Dismiss on click outside chart + panel
    useEffect(() => {
        if (!selectedRun) return undefined;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const chartContainer = canvasRef.current?.parentElement;
            const panel = panelRef.current;

            if (chartContainer && chartContainer.contains(target)) return;
            if (panel && panel.contains(target)) return;

            clearSelection();
        };

        // Delay to avoid catching the same click that set the selection
        const timer = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [selectedRun, clearSelection]);

    // Create/recreate chart
    useEffect(() => {
        if (!canvasRef.current || history.length === 0) return undefined;
        if (chartRef.current) chartRef.current.destroy();

        const handleBarClick = (_event: unknown, elements: Array<{ index: number; datasetIndex: number }>) => {
            if (elements.length === 0) return;

            const index = elements[0].index;
            const entry = history[index];
            const { failedCount, skippedCount } = computeRunMetrics(entry);

            const run: SelectedRun = {
                runId: entry.timestamp,
                index,
                label: formatRunLabel(entry.label, entry.timestamp),
                timestamp: formatTimestamp(entry.timestamp),
                metrics: {
                    passed: entry.outcomes.passed,
                    failed: failedCount,
                    skipped: skippedCount,
                    fastest: formatDuration(entry.fastest),
                    slowest: formatDuration(entry.slowest),
                    average: formatDuration(entry.average),
                    total: formatDuration(entry.duration),
                },
            };
            setSelectedRun(run);

            // Highlight the selected bar
            if (chartRef.current) {
                const activeElements = chartRef.current.data.datasets
                    .map((_ds, datasetIndex) => ({ datasetIndex, index }))
                    .filter((_element, i) => i < 3); // Only the stacked bar datasets
                chartRef.current.setActiveElements(activeElements);
                chartRef.current.update('none');
            }
        };

        const isMobile = window.innerWidth <= 768;

        chartRef.current = new Chart(canvasRef.current, {
            type: 'bar',
            data: {
                labels: isMobile
                    ? abbreviateRunLabels(history)
                    : history.map(h => formatRunLabel(h.label, h.timestamp)),
                datasets: buildTrendDatasets(history, chartTheme),
            },
            options: buildTrendOptions(history, chartTheme, handleBarClick),
        });

        // Add onPanComplete callback to track pan position for fade overlays
        const hasPannableContent = history.length > 5;

        if (isMobile && hasPannableContent && chartRef.current.options.plugins?.zoom) {
            const zoomConfig = chartRef.current.options.plugins.zoom as Record<string, unknown>;
            const panConfig = zoomConfig.pan as Record<string, unknown>;
            panConfig.onPanComplete = ({ chart }: { chart: Chart }) => {
                setCanPanLeft(chart.scales.x.min > 0);
                setCanPanRight(chart.scales.x.max < history.length - 1);
            };
        }

        // Set initial fade state on mobile when there's pannable content
        if (isMobile && hasPannableContent) {
            setCanPanLeft(true);    // chart starts at rightmost, so older bars are to the left
            setCanPanRight(false);  // already at the right edge
        } else {
            setCanPanLeft(false);
            setCanPanRight(false);
        }

        // Override Hammer.js touch-action: none on mobile to allow vertical page scroll
        // Hammer sets 'none' when both pan and pinch are registered; we only need horizontal pan
        if (canvasRef.current && isMobile) {
            canvasRef.current.style.touchAction = 'pan-y';
        }

        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [history, chartTheme]);

    if (history.length === 0) return null;

    const handleNavigate = () => {
        if (selectedRun) {
            onNavigate('/tests?run=' + selectedRun.runId);
        }
    };

    return html`
    <div class="trend-chart-wrapper">
      <div class="trend-chart-container" ref=${containerRef} style="position:relative;width:100%;height:300px">
        <div class="trend-chart-fade-left ${canPanLeft ? 'visible' : ''}" aria-hidden="true"></div>
        <div class="trend-chart-fade-right ${canPanRight ? 'visible' : ''}" aria-hidden="true"></div>
        <canvas ref=${canvasRef} role="img" aria-label="Trend chart showing test outcomes and duration across recent test runs"></canvas>
      </div>
      ${selectedRun && html`
        <div class="run-details-panel" ref=${panelRef} data-testid="run-details-panel">
          <div class="run-details-header">
            <div class="run-details-title">${selectedRun.label}</div>
            <button class="run-details-close" onClick=${clearSelection} aria-label="Close details panel">✕</button>
          </div>
          <div class="run-details-metrics">
            <div class="run-details-metric">
              <span class="run-details-metric-value">${selectedRun.metrics.passed + selectedRun.metrics.failed + selectedRun.metrics.skipped}</span>
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
          <button class="run-details-cta" onClick=${handleNavigate} data-testid="run-details-cta">
            Open run details →
          </button>
        </div>
      `}
    </div>
  `;
}
