import type { ReportHistoryEntry } from '../../../src/ReportData';
import { formatDuration, formatRunLabel } from '../../utils';

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
            data: history.map(h => (h.outcomes.failed || 0) + (h.outcomes.error || 0) + (h.outcomes.compromised || 0)),
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

export function buildTrendOptions(history: ReportHistoryEntry[], theme: string, onNavigate: (path: string) => void): Record<string, unknown> {
    const { isDark, textColor, gridColor } = themeColors(theme);
    const allDurations = history.flatMap(h => [h.fastest, h.slowest, h.average, h.duration].filter(v => v > 0));
    const minDuration = allDurations.length > 0 ? Math.min(...allDurations) : undefined;
    const maxDuration = allDurations.length > 0 ? Math.max(...allDurations) : undefined;

    return {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 100,
        layout: { padding: { top: 8, right: 4, bottom: 0, left: 0 } },
        interaction: { intersect: false, mode: 'index' as const },
        onClick: (_event: unknown, elements: Array<{ index: number }>) => {
            if (elements.length > 0) {
                onNavigate('/tests?run=' + history[elements[0].index].timestamp);
            }
        },
        plugins: {
            legend: buildLegendConfig(textColor),
            tooltip: buildTooltipConfig(isDark, history),
            zoom: {
                pan: { enabled: true, mode: 'x' as const },
                zoom: { wheel: { enabled: false }, pinch: { enabled: true }, mode: 'x' as const },
                limits: { x: { min: 0, max: history.length - 1 } },
            },
        },
        scales: {
            x: {
                stacked: true,
                border: { display: false },
                ticks: { color: textColor, font: { size: 10 }, maxRotation: 0, padding: 4 },
                grid: { display: false },
                min: window.innerWidth <= 768 && history.length > 3 ? history.length - 3 : undefined,
                max: history.length - 1,
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

function buildTooltipConfig(isDark: boolean, history: ReportHistoryEntry[]) {
    return {
        usePointStyle: true,
        backgroundColor: isDark ? 'rgba(30,28,38,0.95)' : 'rgba(255,255,255,0.97)',
        titleColor: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(46,38,61,0.9)',
        bodyColor: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(46,38,61,0.7)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: { top: 10, right: 14, bottom: 10, left: 14 },
        titleFont: { size: 12, weight: 600 },
        bodyFont: { size: 11 },
        titleMarginBottom: 8,
        bodySpacing: 6,
        boxPadding: 6,
        callbacks: {
            title: (items: Array<{ dataIndex: number }>) => {
                return formatRunLabel(history[items[0].dataIndex].label, history[items[0].dataIndex].timestamp);
            },
            label: (context: { dataset: { label?: string }; raw: unknown }) => {
                const label = context.dataset.label || '';
                if (label === 'Duration Range') {
                    const [low, high] = context.raw as [number, number];
                    return '  Fastest: ' + formatDuration(low) + '  ·  Slowest: ' + formatDuration(high);
                }
                if (label === 'Duration' || label === 'Total Duration' || label === 'Average Duration') {
                    return '  ' + label + ':  ' + formatDuration(context.raw as number);
                }
                return '  ' + label + ':  ' + context.raw;
            },
            labelColor: (context: { dataset: { backgroundColor?: unknown; borderColor?: unknown } }) => {
                const bg = context.dataset.backgroundColor as string | undefined;
                const border = context.dataset.borderColor as string | undefined;
                const color = (bg && bg !== 'transparent') ? bg : border;
                return { borderColor: color, backgroundColor: color };
            },
        } as Record<string, unknown>,
    };
}
