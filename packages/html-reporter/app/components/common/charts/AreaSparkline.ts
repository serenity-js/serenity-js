import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

export interface AreaSparklineProps {
    values: number[];
    color: string;
    width?: number;
    height?: number;
}

export function AreaSparkline({ values, color, width = 200, height = 48 }: AreaSparklineProps): ReturnType<typeof html> | null {
    if (!values || values.length < 2) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const padY = 2;
    const pts = values.map((v, i) => ({
        x: (i / (values.length - 1)) * width,
        y: padY + (1 - (v - min) / range) * (height - 2 * padY),
    }));
    const line = pts.map(p => `${p.x},${p.y}`).join(' ');
    const area = `${pts.map(p => `${p.x},${p.y}`).join(' ')} ${width},${height} 0,${height}`;
    return html`
        <svg class="sparkline-area" aria-hidden="true" width="100%" height=${height} viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <polygon fill=${color} points=${area} />
            <polyline fill="none" stroke=${color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points=${line} opacity="0.6" />
        </svg>
    `;
}
