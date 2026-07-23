import { Chart } from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import htm from 'htm';
import { h } from 'preact';

Chart.register(zoomPlugin);
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import type { ReportHistoryEntry } from '../../../../src/cli/ReportData';
import { usePanState } from '../../../hooks/usePanState';
import { formatDuration, formatRunLabel, formatTimestamp } from '../../../utils';
import { computeRunMetrics } from '../../../utils/computeRunMetrics';
import { buildChartConfig } from './buildChartConfig';
import { TrendChartDetails } from './TrendChartDetails';

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
    const [chartTheme, setChartTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');
    const [selectedRun, setSelectedRun] = useState<SelectedRun | null>(null);

    const { canPanLeft, canPanRight, configurePan } = usePanState(canvasRef);

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

        const config = buildChartConfig(history, chartTheme, handleBarClick);
        chartRef.current = new Chart(canvasRef.current, config);

        const isMobile = window.innerWidth <= 768;
        configurePan(chartRef.current, history.length, isMobile);

        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [history, chartTheme, configurePan]);

    if (history.length === 0) {
        return null;
    }

    const handleNavigate = () => {
        if (selectedRun) {
            onNavigate('/tests?run=' + selectedRun.runId);
        }
    };

    return html`
    <div class="trend-chart-wrapper">
      <div class="trend-chart-container" ref=${containerRef} style="position:relative;width:100%;height:300px" data-chart-theme=${chartTheme}>
        <div class="trend-chart-fade-left ${canPanLeft ? 'visible' : ''}" aria-hidden="true"></div>
        <div class="trend-chart-fade-right ${canPanRight ? 'visible' : ''}" aria-hidden="true"></div>
        <canvas ref=${canvasRef} role="img" aria-label="Trend chart showing test outcomes and duration across recent test runs"></canvas>
      </div>
      ${selectedRun && html`
        <${TrendChartDetails}
          selectedRun=${selectedRun}
          panelRef=${panelRef}
          onClose=${clearSelection}
          onNavigate=${handleNavigate}
        />`}
    </div>
  `;
}
