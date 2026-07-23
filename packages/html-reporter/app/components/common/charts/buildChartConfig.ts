import type { ChartConfiguration } from 'chart.js';

import type { ReportHistoryEntry } from '../../../../src/cli/ReportData';
import { abbreviateRunLabels, formatRunLabel } from '../../../utils';
import { buildTrendDatasets, buildTrendOptions } from './trendChartConfig';

export function buildChartConfig(
    history: ReportHistoryEntry[],
    chartTheme: string,
    handleBarClick: (_event: unknown, elements: Array<{ index: number; datasetIndex: number }>) => void,
): ChartConfiguration {
    const isMobile = window.innerWidth <= 768;

    return {
        type: 'bar',
        data: {
            labels: isMobile
                ? abbreviateRunLabels(history)
                : history.map(h => formatRunLabel(h.label, h.timestamp)),
            datasets: buildTrendDatasets(history, chartTheme),
        },
        options: buildTrendOptions(history, chartTheme, handleBarClick),
    };
}
