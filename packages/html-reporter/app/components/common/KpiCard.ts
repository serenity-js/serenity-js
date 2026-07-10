import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

export interface KpiCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    ariaLabel: string;
    valueColor?: string;
}

export function KpiCard({ label, value, subtitle, ariaLabel, valueColor }: KpiCardProps): ReturnType<typeof html> {
    return html`
        <div class="kpi-card" tabindex="0" aria-label="${ariaLabel}" data-testid="kpi-card">
            <span class="kpi-label">${label}</span>
            <span class="kpi-value" style=${valueColor ? `color:${valueColor}` : ''}>${value}</span>
            ${subtitle ? html`<span class="kpi-subtitle">${subtitle}</span>` : null}
        </div>
    `;
}
