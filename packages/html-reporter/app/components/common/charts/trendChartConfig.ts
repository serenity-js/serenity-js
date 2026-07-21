import type { ReportHistoryEntry } from '../../../../src/cli/ReportData';
import { formatDuration, totalFailedCount } from '../../../utils';

interface ThemeColors {
    textColor: string;
    gridColor: string;
    isDark: boolean;
}

function themeColors(chartTheme: string): ThemeColors {
    const isDark = chartTheme === 'dark';
    return {
        isDark,
        textColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(46,38,61,0.45)',
        gridColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    };
}

export function buildTrendDatasets(history: ReportHistoryEntry[], theme: string): Record<string, unknown>[] {
    const { isDark } = themeColors(theme);
    return [
        {
            type: 'bar' as const,
            label: 'Passed',
            data: history.map(h => h.outcomes.passed),
            backgroundColor: isDark ? 'rgba(40,199,111,0.85)' : 'rgba(40,199,111,0.8)',
            borderRadius: 2,
            stack: 'outcomes',
            maxBarThickness: 56,
            yAxisID: 'y',
            order: 2,
        },
        {
            type: 'bar' as const,
            label: 'Failed',
            data: history.map(h => totalFailedCount(h.outcomes)),
            backgroundColor: isDark ? 'rgba(234,84,85,0.85)' : 'rgba(234,84,85,0.8)',
            borderRadius: 2,
            stack: 'outcomes',
            maxBarThickness: 56,
            yAxisID: 'y',
            order: 2,
        },
        {
            type: 'bar' as const,
            label: 'Skipped',
            data: history.map(h => (h.outcomes.skipped || 0) + (h.outcomes.pending || 0)),
            backgroundColor: isDark ? 'rgba(168,170,174,0.5)' : 'rgba(168,170,174,0.45)',
            borderRadius: 2,
            stack: 'outcomes',
            maxBarThickness: 56,
            yAxisID: 'y',
            order: 2,
        },
        {
            type: 'line' as const,
            label: 'Total Duration',
            data: history.map(h => h.duration),
            borderColor: isDark ? 'rgba(105,108,255,0.5)' : 'rgba(105,108,255,0.4)',
            backgroundColor: 'transparent',
            borderDash: [4, 3],
            borderWidth: 1.5,
            fill: false,
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 4,
            pointBackgroundColor: isDark ? 'rgba(105,108,255,0.7)' : 'rgba(105,108,255,0.6)',
            yAxisID: 'y1',
            order: 1,
        },
        {
            type: 'bar' as const,
            label: 'Duration Range',
            data: history.map(h => [h.fastest || 0, h.slowest || 0]) as unknown as number[],
            backgroundColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)',
            borderColor: 'transparent',
            borderWidth: 0,
            borderSkipped: false as const,
            barPercentage: 0.04,
            categoryPercentage: 1,
            maxBarThickness: 2,
            yAxisID: 'y1',
            order: 0,
            grouped: false,
        },
        {
            type: 'line' as const,
            label: 'Average Duration',
            data: history.map(h => h.average || 0),
            borderColor: 'transparent',
            backgroundColor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(46,38,61,0.5)',
            pointStyle: 'rectRounded' as const,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 0,
            fill: false,
            showLine: false,
            yAxisID: 'y1',
            order: 0,
        },
    ];
}

export function buildTrendOptions(history: ReportHistoryEntry[], theme: string, onClick: (_event: unknown, elements: Array<{ index: number; datasetIndex: number }>) => void): Record<string, unknown> {
    const { textColor, gridColor } = themeColors(theme);
    const allDurations = history.flatMap(h => [h.fastest, h.slowest, h.average, h.duration].filter(v => v > 0));
    const minDuration = allDurations.length > 0 ? Math.min(...allDurations) : undefined;
    const maxDuration = allDurations.length > 0 ? Math.max(...allDurations) : undefined;

    return {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 100,
        layout: { padding: { top: 8, right: 4, bottom: 0, left: 0 } },
        interaction: { intersect: false, mode: 'index' as const },
        onClick,
        plugins: {
            legend: buildLegendConfig(textColor),
            tooltip: { enabled: false },
            zoom: {
                pan: { enabled: true, mode: 'x' as const, threshold: 10 },
                zoom: {
                    wheel: { enabled: false },
                    pinch: { enabled: typeof window !== 'undefined' && window.innerWidth > 768 },
                    mode: 'x' as const,
                },
                limits: { x: { min: 0, max: history.length - 1 } },
            },
        },
        scales: {
            x: {
                stacked: true,
                min: typeof window !== 'undefined' && window.innerWidth <= 768 && history.length > 5 ? history.length - 5 : undefined,
                border: { display: false },
                ticks: {
                    color: textColor,
                    font: { size: 10 },
                    maxRotation: typeof window !== 'undefined' && window.innerWidth <= 768 ? 45 : 0,
                    padding: 4,
                },
                grid: { display: false },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                border: { display: false },
                ticks: { color: textColor, font: { size: 10 }, precision: 0, padding: 8 },
                grid: { color: gridColor, drawTicks: false },
                title: { display: false },
            },
            y1: {
                type: 'logarithmic' as const,
                position: 'right' as const,
                min: minDuration ? minDuration * 0.8 : undefined,
                max: maxDuration ? maxDuration * 1.2 : undefined,
                border: { display: false },
                ticks: { color: textColor, font: { size: 10 }, callback: (v: number | string) => formatDuration(Number(v)), maxTicksLimit: 5, padding: 8 },
                grid: { drawOnChartArea: false },
                title: { display: false },
            },
        },
    };
}

function buildLegendConfig(textColor: string) {
    return {
        display: true,
        position: 'bottom' as const,
        labels: {
            color: textColor,
            boxWidth: 12,
            boxHeight: 12,
            useBorderRadius: true,
            borderRadius: 2,
            padding: 20,
            font: { size: 11 },
        },
    };
}

