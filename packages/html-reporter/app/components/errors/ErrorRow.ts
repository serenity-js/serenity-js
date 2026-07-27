import htm from 'htm';
import { h } from 'preact';

import type { ReportScenario } from '../../../src/cli/ReportData';
import { formatDuration, outcomeClass, relativeSourcePath, scenarioUrl, stripAbsolutePaths, stripAnsi } from '../../utils';
import { link } from '../../utils/link.js';
import { OutcomeBadge } from '../common/OutcomeBadge';

const html = htm.bind(h);

export interface ErrorRowProps {
    scenario: ReportScenario;
    duplicateCount: number;
    specDirectory?: string;
    onNavigate: (path: string) => void;
}

export function ErrorRow({ scenario: s, duplicateCount, specDirectory, onNavigate }: ErrorRowProps): ReturnType<typeof html> {
    const clickTarget = duplicateCount > 1
        ? link({ view: 'tests', search: `"${s.error ? s.error.message : s.outcome}"` })
        : scenarioUrl(s);

    return html`
    <div class="scenario-item" onClick=${() => onNavigate(clickTarget)}
         style="height:100%;display:flex;align-items:flex-start">
      <${OutcomeBadge} outcome=${s.outcome} size="xs" />
      <div class="scenario-info">
        <div class="scenario-name">${s.name}${duplicateCount > 1 ? html` <span style="font-size:var(--font-xs);font-weight:400;color:var(--text-disabled)">and ${duplicateCount - 1} more</span>` : null}</div>
        <div style="font-size:var(--font-sm);color:var(--color-${outcomeClass(s.outcome)});margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${stripAnsi(stripAbsolutePaths(s.error ? s.error.message : s.outcome, specDirectory))}${duplicateCount > 1 ? html` <span style="font-weight:600">(×${duplicateCount})</span>` : null}</div>
        <div class="scenario-meta">
          <span class="scenario-source" style="direction:rtl;text-align:left;unicode-bidi:plaintext">${relativeSourcePath(s, specDirectory)}</span>
        </div>
      </div>
      <span class="scenario-duration">${formatDuration(s.duration)}</span>
    </div>
  `;
}
