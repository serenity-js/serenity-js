import { Chart } from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import htm from 'htm';
import { h } from 'preact';
import { createPortal } from 'preact/compat';

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
    modules?: Array<{
        moduleId: string;
        startedAt: string;
        finishedAt?: string;
        outcome?: 'passed' | 'failed' | 'incomplete';
        outcomes?: {
            passed: number;
            failed: number;
            pending: number;
            skipped: number;
            compromised: number;
            error: number;
        };
    }>;
}

export interface TrendChartProps {
    history: ReportHistoryEntry[];
    onNavigate: (path: string) => void;
}

function useThemeObserver(): string {
    const [chartTheme, setChartTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const t = document.documentElement.getAttribute('data-theme') || 'light';
            setChartTheme(t);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => { observer.disconnect(); };
    }, []);

    return chartTheme;
}

function useEscapeDismiss(selectedRun: SelectedRun | null, clearSelection: () => void): void {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedRun) {
                clearSelection();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedRun, clearSelection]);
}

function useClickOutsideDismiss(
    selectedRun: SelectedRun | null,
    canvasRef: { current: HTMLCanvasElement | null },
    panelRef: { current: HTMLDivElement | null },
    clearSelection: () => void,
): void {
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

        const timer = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [selectedRun, clearSelection]);
}

function buildSelectedRun(entry: ReportHistoryEntry, index: number): SelectedRun {
    const { failedCount, skippedCount } = computeRunMetrics(entry);
    return {
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
        ...(entry.modules ? { modules: entry.modules } : {}),
    };
}

interface ChartInstanceOptions {
    canvasRef: { current: HTMLCanvasElement | null };
    chartRef: { current: Chart | null };
    history: ReportHistoryEntry[];
    chartTheme: string;
    configurePan: (chart: Chart, dataLength: number, isMobile: boolean) => void;
    onBarClick: (entry: ReportHistoryEntry, index: number) => void;
}

function useChartInstance(options: ChartInstanceOptions): void {
    const { canvasRef, chartRef, history, chartTheme, configurePan, onBarClick } = options;
    useEffect(() => {
        if (!canvasRef.current || history.length === 0) return undefined;
        if (chartRef.current) chartRef.current.destroy();

        const handleBarClick = (_event: unknown, elements: Array<{ index: number; datasetIndex: number }>) => {
            if (elements.length === 0) return;
            const index = elements[0].index;
            onBarClick(history[index], index);
        };

        const config = buildChartConfig(history, chartTheme, handleBarClick);
        chartRef.current = new Chart(canvasRef.current, config);

        const isMobile = window.innerWidth <= 768;
        configurePan(chartRef.current, history.length, isMobile);

        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [history, chartTheme, configurePan, onBarClick]);
}

export function TrendChart({ history, onNavigate }: TrendChartProps): ReturnType<typeof html> | null {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const [selectedRun, setSelectedRun] = useState<SelectedRun | null>(null);
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

    const chartTheme = useThemeObserver();
    const { canPanLeft, canPanRight, configurePan } = usePanState(canvasRef);

    // Track viewport size for conditional portal rendering
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedRun(null);
        if (chartRef.current) {
            chartRef.current.setActiveElements([]);
            chartRef.current.update('none');
        }
    }, []);

    useEscapeDismiss(selectedRun, clearSelection);
    useClickOutsideDismiss(selectedRun, canvasRef, panelRef, clearSelection);

    const handleBarClick = useCallback((entry: ReportHistoryEntry, index: number) => {
        const run = buildSelectedRun(entry, index);
        setSelectedRun(run);

        if (chartRef.current) {
            const activeElements = chartRef.current.data.datasets
                .map((_ds, datasetIndex) => ({ datasetIndex, index }))
                .filter((_element, i) => i < 3);
            chartRef.current.setActiveElements(activeElements);
            chartRef.current.update('none');
        }
    }, []);

    useChartInstance({ canvasRef, chartRef, history, chartTheme, configurePan, onBarClick: handleBarClick });

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
      ${selectedRun && !isMobile && html`
        <${TrendChartDetails}
          selectedRun=${selectedRun}
          panelRef=${panelRef}
          onClose=${clearSelection}
          onNavigate=${handleNavigate}
        />`}
      ${selectedRun && isMobile && createPortal(html`
        <${TrendChartDetails}
          selectedRun=${selectedRun}
          panelRef=${panelRef}
          onClose=${clearSelection}
          onNavigate=${handleNavigate}
        />`, document.body)}
    </div>
  `;
}
