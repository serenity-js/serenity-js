import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

export interface DotTrendProps {
    values: number[];
    color: string;
    maxHeight?: number;
}

export function DotTrend({ values, color, maxHeight = 20 }: DotTrendProps): ReturnType<typeof html> | null {
    if (!values || values.length < 2) return null;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    return html`
        <div class="kpi-dots" aria-hidden="true">
            ${values.slice(-7).map(v => {
                const h = 4 + ((v - min) / range) * (maxHeight - 4);
                return html`<span class="kpi-dot" style="height:${h}px;background:${color}"></span>`;
            })}
        </div>
    `;
}
