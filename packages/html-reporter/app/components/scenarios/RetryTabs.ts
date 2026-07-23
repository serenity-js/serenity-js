import htm from 'htm';
import { h } from 'preact';

import type { ReportAttempt } from '../../../src/cli/ReportData';
import { useScrollFade } from '../../hooks/useScrollFade';
import { outcomeClass, useHashHistory } from '../../utils';

const html = htm.bind(h);

interface RetryTabsProps {
    attempts: ReportAttempt[];
    activeAttempt: number;
    onSelect: (index: number) => void;
}

export function RetryTabs({ attempts, activeAttempt, onSelect }: RetryTabsProps): ReturnType<typeof html> {
    const hashNav = useHashHistory();
    const { ref, fadeClass } = useScrollFade<HTMLDivElement>();

    return html`
        <div class="retry-tabs scroll-x-hidden${fadeClass}" ref=${ref}>
          ${attempts.map((attempt, i) => html`
            <div class="retry-tab ${activeAttempt === i ? 'active' : ''} ${outcomeClass(attempt.outcome)}"
                 onClick=${() => { onSelect(i); hashNav.setParam('attempt', String(i + 1)); }}>
              Attempt ${attempt.attemptNumber} (${attempt.outcome === 'SUCCESS' ? 'passed' : 'failed'})
            </div>
          `)}
        </div>
    `;
}
