import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

export interface DashboardKpiCardProps {
    label: string;
    value: string | number;
    ariaLabel: string;
    onClick: () => void;
    valueColor?: string;
    variant?: 'hero' | 'operational';
    children?: unknown;
}

export function DashboardKpiCard({ label, value, ariaLabel, onClick, valueColor, variant, children }: DashboardKpiCardProps): ReturnType<typeof html> {
    const variantClass = variant ? ` kpi-card--${variant}` : '';

    return html`
        <button type="button" class="kpi-card${variantClass}" onClick=${onClick} aria-label="${ariaLabel}" data-testid="dashboard-kpi-card">
            <span class="kpi-label">${label}</span>
            <span class="kpi-value" style=${valueColor ? `color:${valueColor}` : ''}>${value}</span>
            ${children}
        </button>
    `;
}
