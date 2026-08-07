import type { ChartConfiguration } from 'chart.js';

import type { ReportHistoryEntry } from '../../../../src/cli/reporting/ReportData.js';
import { abbreviateRunLabels, formatRunLabel } from '../../../utils/index.js';
import { buildTrendDatasets, buildTrendOptions } from './trendChartConfig.js';

export function buildChartConfig(
    history: ReportHistoryEntry[],
    chartTheme: string,
    handleBarClick: (_event: unknown, elements: Array<{ index: number; datasetIndex: number }>) => void,
): ChartConfiguration {
    const isMobile = window.innerWidth <= 768;

    const baseLabels = isMobile
        ? abbreviateRunLabels(history)
        : history.map(h => formatRunLabel(h.label, h.timestamp));

    const labels: Array<string | string[]> = baseLabels.map((label, index) => {
        const entry = history[index];
        const hasIncompleteModules = entry.modules?.some(m => !m.finishedAt);
        const parts = label.split(' — ');
        const line1 = parts[0];
        const line2 = parts.slice(1).join(' — ') || '';
        return hasIncompleteModules
            ? ['⚠️ ' + line1, line2]
            : [line1, line2];
    });

    return {
        type: 'bar',
        data: {
            labels,
            datasets: buildTrendDatasets(history, chartTheme),
        },
        options: buildTrendOptions(history, chartTheme, handleBarClick),
    };
}
