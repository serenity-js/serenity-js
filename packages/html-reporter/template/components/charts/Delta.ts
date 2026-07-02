import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

export interface DeltaProps {
    current: number;
    previous: number | undefined;
    invert?: boolean;
    suffix?: string;
}

export function Delta({ current, previous, invert = false, suffix = '' }: DeltaProps): ReturnType<typeof html> | null {
    if (previous === undefined || previous === null) return null;
    const diff = current - previous;
    if (diff === 0) return html`<span class="kpi-delta kpi-delta--neutral">— no change</span>`;
    const positive = invert ? diff < 0 : diff > 0;
    const cls = positive ? 'kpi-delta--positive' : 'kpi-delta--negative';
    const arrow = positive ? '↑' : '↓';
    return html`<span class="kpi-delta ${cls}">${arrow} ${Math.abs(diff)}${suffix}</span>`;
}
