import htm from 'htm';
import { h } from 'preact';
import { useCallback, useRef } from 'preact/hooks';

import type { ReportActivity, ReportScenario } from '../../../src/cli/ReportData.js';
import { RawHtml } from '../../utils/index.js';
import { ActivityNode } from './ActivityNode.js';
import { ParameterSetGroups } from './ParameterSetGroups.js';

const html = htm.bind(h);

interface ActivityTreeCardProps {
    scenario: ReportScenario;
    currentActivities: ReportActivity[];
}

/**
 * Returns all visible treeitem elements (those not inside a collapsed ancestor).
 * A treeitem is visible if none of its ancestor treeitems have aria-expanded="false".
 */
function getVisibleTreeItems(container: HTMLElement): HTMLElement[] {
    const all = container.querySelectorAll<HTMLElement>('[role="treeitem"]');
    return Array.from(all).filter(item => {
        let element: HTMLElement | null = item.parentElement;
        while (element && element !== container) {
            if (element.getAttribute('role') === 'treeitem' && element.getAttribute('aria-expanded') === 'false') {
                return false;
            }
            element = element.parentElement;
        }
        return true;
    });
}

export function ActivityTreeCard({ scenario, currentActivities }: ActivityTreeCardProps): ReturnType<typeof html> {
    const treeRef = useRef<HTMLElement>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const container = treeRef.current;
        if (!container) return;

        const items = getVisibleTreeItems(container);
        const active = document.activeElement as HTMLElement;
        const currentItem = active?.closest('[role="treeitem"]') as HTMLElement | null;
        const currentIndex = currentItem ? items.indexOf(currentItem) : -1;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < items.length - 1) {
                    items[currentIndex + 1]?.focus();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    items[currentIndex - 1]?.focus();
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentItem) {
                    const isExpanded = currentItem.getAttribute('aria-expanded');
                    if (isExpanded === 'false') {
                        const row = currentItem.querySelector('.activity-row') as HTMLElement;
                        row?.click();
                    } else if (isExpanded === 'true') {
                        const group = currentItem.querySelector('[role="group"]');
                        const firstChild = group?.querySelector('[role="treeitem"]') as HTMLElement;
                        firstChild?.focus();
                    }
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (currentItem) {
                    const isExpanded = currentItem.getAttribute('aria-expanded');
                    if (isExpanded === 'true') {
                        const row = currentItem.querySelector('.activity-row') as HTMLElement;
                        row?.click();
                    } else {
                        const parent = currentItem.parentElement?.closest('[role="treeitem"]') as HTMLElement;
                        if (parent && container.contains(parent)) {
                            parent.focus();
                        }
                    }
                }
                break;
            case 'Home':
                e.preventDefault();
                items[0]?.focus();
                break;
            case 'End':
                e.preventDefault();
                items[items.length - 1]?.focus();
                break;
            case 'Enter':
            case ' ':
                if (currentItem?.getAttribute('aria-expanded') !== undefined && currentItem?.getAttribute('aria-expanded') !== null) {
                    e.preventDefault();
                    const row = currentItem.querySelector('.activity-row') as HTMLElement;
                    row?.click();
                }
                break;
        }
    }, []);

    return html`
        <div class="card mb-md">
          ${scenario.description ? html`
            <div class="req-detail-readme readme-content mb-md"><${RawHtml} content=${scenario.description} /></div>
          ` : null}
          <h2 class="card-title mb-sm">Activity Tree</h2>
          ${scenario.scenarioOutline ? html`
            <div class="mb-md panel-section font-mono text-sm" style="background:var(--bg-primary);border-radius:var(--radius-sm);white-space:pre-line;color:var(--text-secondary)">${scenario.scenarioOutline.template}</div>
            <${ParameterSetGroups} parameters=${scenario.scenarioOutline.parameters} />
          ` : html`
            <div class="activity-tree" role="tree" aria-label="Activity tree" ref=${treeRef} onKeyDown=${handleKeyDown}>
              ${currentActivities.map((activity, index) => html`<${ActivityNode} activity=${activity} level=${1} posInSet=${index + 1} setSize=${currentActivities.length} />`)}
            </div>
          `}
        </div>
    `;
}
