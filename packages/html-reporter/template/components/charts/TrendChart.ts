import 'chartjs-plugin-zoom';

import { Chart } from 'chart.js/auto';
import htm from 'htm';
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import type { ReportHistoryEntry } from '../../../src/ReportData';
import { formatRunLabel } from '../../utils';
import { buildTrendDatasets, buildTrendOptions } from './trendChartConfig';

const html = htm.bind(h);
export interface TrendChartProps {
    history: ReportHistoryEntry[];
    onNavigate: (path: string) => void;
}

export function TrendChart({ history, onNavigate }: TrendChartProps): ReturnType<typeof html> | null {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart | null>(null);
    const [chartTheme, setChartTheme] = useState(() => localStorage.getItem('serenity-theme') || 'light');

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const t = document.documentElement.getAttribute('data-theme') || 'light';
            setChartTheme(t);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        const handleResize = () => {
            if (!chartRef.current) return;
            const isMobile = window.innerWidth <= 768;
            const xScale = chartRef.current.options.scales!.x as { min?: number };
            if (isMobile && history.length > 3) {
                xScale.min = history.length - 3;
            } else {
                xScale.min = undefined;
            }
            chartRef.current.update('none');
        };
        window.addEventListener('resize', handleResize);

        return () => { observer.disconnect(); window.removeEventListener('resize', handleResize); };
    }, []);
    useEffect(() => {
        if (!canvasRef.current || history.length === 0) return;
        if (chartRef.current) chartRef.current.destroy();

        chartRef.current = new Chart(canvasRef.current, {
            type: 'bar',
            data: {
                labels: history.map(h => formatRunLabel(h.label, h.timestamp)),
                datasets: buildTrendDatasets(history, chartTheme),
            },
            options: buildTrendOptions(history, chartTheme, onNavigate),
        });
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [history, chartTheme]);
    if (history.length === 0) return null;

    return html`
    <div style="position:relative;width:100%;height:300px;overflow:hidden">
      <canvas ref=${canvasRef} role="img" aria-label="Trend chart showing test outcomes and duration across recent test runs"></canvas>
    </div>
  `;
}
