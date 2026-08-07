import htm from 'htm';
import { h } from 'preact';

import type { ReportOutcomes } from '../../../../src/cli/reporting/ReportData.js';
import { totalFailedCount } from '../../../utils/index.js';

const html = htm.bind(h);

export interface SegmentedBarProps {
    outcomes: ReportOutcomes;
    className?: string;
}

export function SegmentedBar({ outcomes, className }: SegmentedBarProps): ReturnType<typeof html> | null {
    const total = Object.values(outcomes).reduce((a: number, b: number) => a + b, 0);
    if (total === 0) return null;
    const passedCount = outcomes.passed || 0;
    const failedCount = totalFailedCount(outcomes);
    const skippedCount = (outcomes.pending || 0) + (outcomes.skipped || 0);
    const passed = passedCount / total * 100;
    const failed = failedCount / total * 100;
    const skipped = skippedCount / total * 100;
    const height = className === 'req-detail-outcome-bar' ? '10px' : '6px';
    const tooltip = `${passedCount} passed, ${failedCount} failed, ${skippedCount} skipped`;
    return html`
        <div class=${className || 'req-tree-bars'} role="img" aria-label=${tooltip} style="display:flex;overflow:hidden;border-radius:3px;background:var(--divider);height:${height};min-height:${height}" title=${tooltip}>
            <span class="visually-hidden">${tooltip}</span>
            ${passed > 0 ? html`<div aria-hidden="true" style="width:${passed}%;height:100%;background:var(--color-passed)"></div>` : null}
            ${failed > 0 ? html`<div aria-hidden="true" style="width:${failed}%;height:100%;background:var(--color-failed)"></div>` : null}
            ${skipped > 0 ? html`<div aria-hidden="true" style="width:${skipped}%;height:100%;background:var(--color-skipped)"></div>` : null}
        </div>
    `;
}
