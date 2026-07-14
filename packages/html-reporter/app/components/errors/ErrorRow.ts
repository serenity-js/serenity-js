import htm from 'htm';
import { h } from 'preact';

import type { ReportScenario } from '../../../src/cli/ReportData';
import { ansiToHtml, formatDuration, outcomeClass, outcomeIcon, relativeSourcePath, scenarioUrl } from '../../utils';

const html = htm.bind(h);

export interface ErrorRowProps {
    scenario: ReportScenario;
    duplicateCount: number;
    specDirectory?: string;
    onNavigate: (path: string) => void;
}

export function ErrorRow({ scenario: s, duplicateCount, specDirectory, onNavigate }: ErrorRowProps): ReturnType<typeof html> {
    const clickTarget = duplicateCount > 1
        ? '/tests?search=' + encodeURIComponent('"' + (s.error ? s.error.message : s.outcome) + '"')
        : scenarioUrl(s);

    return html`
    <div class="scenario-item" onClick=${() => onNavigate(clickTarget)}
         style="height:100%;display:flex;align-items:flex-start">
      <div class="scenario-outcome-icon ${outcomeClass(s.outcome)}" style="width:20px;height:20px;font-size:var(--font-2xs);margin-top:2px;flex-shrink:0">${outcomeIcon(s.outcome)}</div>
      <div class="scenario-info">
        <div class="scenario-name">${s.name}${duplicateCount > 1 ? html` <span style="font-size:var(--font-xs);font-weight:400;color:var(--text-disabled)">and ${duplicateCount - 1} more</span>` : null}</div>
        <div style="font-size:var(--font-sm);color:var(--color-${outcomeClass(s.outcome)});margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" dangerouslySetInnerHTML=${{ __html: ansiToHtml(s.error ? s.error.message : s.outcome) + (duplicateCount > 1 ? ` <span style="font-weight:600"> (×${duplicateCount})</span>` : '') }}></div>
        <div class="scenario-meta">
          <span class="scenario-source" style="direction:rtl;text-align:left;unicode-bidi:plaintext">${relativeSourcePath(s, specDirectory)}</span>
        </div>
      </div>
      <span class="scenario-duration">${formatDuration(s.duration)}</span>
    </div>
  `;
}
