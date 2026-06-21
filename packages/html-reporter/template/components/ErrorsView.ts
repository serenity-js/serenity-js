/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { defaultRangeExtractor } from '@tanstack/virtual-core';
import htm from 'htm';
import { h } from 'preact';
import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';

import { useVirtualizer } from '../hooks';
import { DATA, formatDuration, outcomeClass, outcomeIcon, relativeSourcePath, scenarioUrl } from '../utils';
import { icons } from './icons';

const html = htm.bind(h);

export function ErrorsView({ onNavigate, route }) {
    const errorRunParameters = (route && route.includes('?')) ? new URLSearchParams(route.split('?')[1]) : null;
    const errorRunString = errorRunParameters ? errorRunParameters.get('run') : null;
    const errorRunIndex = useMemo(() => {
        if (errorRunString === null) return null;
        const byTs = DATA.history.findIndex(r => r.timestamp === errorRunString);
        if (byTs >= 0) return byTs;
        const parsed = parseInt(errorRunString, 10);
        return isNaN(parsed) ? null : parsed;
    }, [errorRunString]);
    const errorIsHistorical = errorRunIndex !== null && errorRunIndex !== DATA.history.length - 1;
    const errorHistoricalRun = errorIsHistorical ? DATA.history[errorRunIndex] : null;

    const errorActiveRunTs = errorRunIndex !== null && DATA.history[errorRunIndex] ? DATA.history[errorRunIndex].timestamp : DATA.history[DATA.history.length - 1]?.timestamp;
    const onErrorRunChange = (e) => {
        const ts = e.target.value;
        const index = DATA.history.findIndex(r => r.timestamp === ts);
        const isLatest = index === DATA.history.length - 1;
        onNavigate(isLatest ? '/errors' : '/errors?run=' + ts);
    };
    const errorShowLatest = () => onNavigate('/errors');

    const errorScenarios = DATA.scenarios.filter(s => s.error || s.outcome === 'FAILURE' || s.outcome === 'ERROR' || s.outcome === 'COMPROMISED');

    function classifyError(error) {
        const name = (error.name || '').toLowerCase();
        const message = (error.message || '').toLowerCase();
        if (name.includes('compromised')) return 'Compromised Tests';
        if (name.includes('assert') || name.includes('assertion')) return 'Assertion Errors';
        if (message.includes('timed out') || message.includes('timeout')) return 'Timeout Errors';
        return 'Runtime Errors';
    }

    const categories = {};
    for (const s of errorScenarios) {
        const cat = classifyError(s.error || { name: s.outcome, message: '' });
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(s);
    }

    const categoryOrder = Object.entries(categories).map(([name, scenarios]) => {
        return { name, scenarios };
    }).sort((a, b) => b.scenarios.length - a.scenarios.length);

    const categoryColors = { 'Assertion Errors': 'var(--color-failed)', 'Compromised Tests': 'var(--color-compromised)', 'Timeout Errors': 'var(--color-pending)', 'Runtime Errors': 'var(--color-failed)' };
    const categoryIcons = { 'Assertion Errors': '≠', 'Compromised Tests': '⚠', 'Timeout Errors': '⏱', 'Runtime Errors': '✗' };

    const summaryCards = categoryOrder.map(cat => ({
        title: cat.name,
        value: String(cat.scenarios.length),
        color: categoryColors[cat.name] || 'var(--color-failed)',
        subtitle: cat.scenarios.length === 1 ? '1 test' : cat.scenarios.length + ' tests',
    }));

    const renderItems = useMemo(() => {
        const items = [];
        for (const cat of categoryOrder) {
            items.push({ type: 'header', icon: categoryIcons[cat.name] || '✗', name: cat.name, count: cat.scenarios.length });
            for (const s of cat.scenarios) {
                items.push({ type: 'scenario', scenario: s });
            }
        }
        return items;
    }, [categoryOrder]);

    const ERROR_ROW_HEIGHT = 108;
    const ERROR_HEADER_HEIGHT_FIRST = 62;
    const ERROR_HEADER_HEIGHT_REST = 78;
    const ERROR_HEADER_CONTENT_HEIGHT = 46;

    const headerIndices = useMemo(() => {
        const indices = [];
        renderItems.forEach((item, i) => { if (item.type === 'header') indices.push(i); });
        return indices;
    }, [renderItems]);

    const errorParentRef = useRef(null);
    const errorActiveStickyRef = useRef(-1);

    const errorRangeExtractor = useCallback((range) => {
        if (headerIndices.length === 0) {
            errorActiveStickyRef.current = -1;
            return defaultRangeExtractor(range);
        }
        let activeStickyIndex = headerIndices[0];
        for (const index of headerIndices) {
            if (index > range.startIndex) break;
            activeStickyIndex = index;
        }
        errorActiveStickyRef.current = activeStickyIndex;
        const defaultRange = defaultRangeExtractor(range);
        if (!defaultRange.includes(activeStickyIndex)) return [activeStickyIndex, ...defaultRange];
        return defaultRange;
    }, [headerIndices]);

    const errorVirtualizer = useVirtualizer({
        count: renderItems.length,
        getScrollElement: () => errorParentRef.current,
        estimateSize: (index) => {
            if (renderItems[index].type !== 'header') return ERROR_ROW_HEIGHT;
            return index === 0 ? ERROR_HEADER_HEIGHT_FIRST : ERROR_HEADER_HEIGHT_REST;
        },
        overscan: 15,
        rangeExtractor: errorRangeExtractor,
    });

    const errorStickyElementRef = useRef(null);
    if (!errorStickyElementRef.current) {
        errorStickyElementRef.current = document.createElement('div');
        errorStickyElementRef.current.id = 'vs-errors-sticky';
        errorStickyElementRef.current.className = 'scenario-group-header';
        errorStickyElementRef.current.style.cssText = 'display:none;position:sticky;top:0;width:100%;height:46px;flex-shrink:0;z-index:3;background:var(--bg-surface);box-shadow:0 1px 0 var(--border-color);margin-bottom:-46px;padding:var(--space-md) var(--space-md) var(--space-sm);font-size:var(--font-sm);font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;direction:ltr';
    }

    const errorParentRefCallback = useCallback((node) => {
        errorParentRef.current = node;
        if (node) {
            const stickyElement = errorStickyElementRef.current;
            if (stickyElement.parentNode !== node) node.insertBefore(stickyElement, node.firstChild);
        }
    }, []);

    useEffect(() => {
        const element = errorParentRef.current;
        const stickyElement = errorStickyElementRef.current;
        if (!element) { stickyElement.style.display = 'none'; return; }
        const headerStarts = [];
        let pos = 0;
        for (let i = 0; i < renderItems.length; i++) {
            if (renderItems[i].type === 'header') headerStarts.push({ index: i, start: pos, item: renderItems[i] });
            const hHeight = i === 0 ? ERROR_HEADER_HEIGHT_FIRST : ERROR_HEADER_HEIGHT_REST;
            pos += renderItems[i].type === 'header' ? hHeight : ERROR_ROW_HEIGHT;
        }
        let currentName = '';
        const onScroll = () => {
            const scrollTop = element.scrollTop;
            let activeHeader = null;
            for (const h of headerStarts) { if (h.start <= scrollTop) activeHeader = h; else break; }
            const activeHeaderHeight = activeHeader && activeHeader.index === 0 ? ERROR_HEADER_HEIGHT_FIRST : ERROR_HEADER_HEIGHT_REST;
            if (!activeHeader || scrollTop <= activeHeader.start + activeHeaderHeight) { stickyElement.style.display = 'none'; return; }
            stickyElement.style.display = 'flex';
            stickyElement.style.alignItems = 'center';
            stickyElement.style.gap = 'var(--space-sm)';
            if (currentName !== activeHeader.item.name) {
                currentName = activeHeader.item.name;
                stickyElement.innerHTML = '';
                const iconSpan = document.createElement('span');
                iconSpan.textContent = activeHeader.item.icon;
                const nameSpan = document.createElement('span');
                nameSpan.textContent = activeHeader.item.name;
                const countSpan = document.createElement('span');
                countSpan.textContent = '(' + activeHeader.item.count + ')';
                countSpan.style.cssText = 'font-size:var(--font-xs);color:var(--text-disabled);font-weight:400';
                stickyElement.appendChild(iconSpan);
                stickyElement.appendChild(nameSpan);
                stickyElement.appendChild(countSpan);
            }
        };
        element.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => element.removeEventListener('scroll', onScroll);
    }, [renderItems]);

    if (errorScenarios.length === 0) {
        return html`
      <div class="placeholder-view">
        ${icons.errors}
        <h2>No Errors</h2>
        <p>All tests passed without errors.</p>
      </div>
    `;
    }

    return html`
    <div>
      ${errorHistoricalRun ? html`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px var(--space-md);margin-bottom:var(--space-md);background:var(--accent-light);border:1px solid var(--accent);border-radius:var(--radius-sm);font-size:var(--font-md)">
          <span>Viewing errors from: <strong>${errorHistoricalRun.label}</strong> (${new Date(errorHistoricalRun.timestamp).toLocaleString()})</span>
          <a onClick=${errorShowLatest} style="cursor:pointer;color:var(--accent);font-weight:500;text-decoration:underline">show latest</a>
        </div>
      ` : null}

      <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md);flex-wrap:wrap">
        <span style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Test run:</span>
        <select class="sort-select" value=${errorActiveRunTs} onChange=${onErrorRunChange} aria-label="Select test run" style="min-width:200px">
          ${[...DATA.history].reverse().map((run) => {
                const passRate = Math.round((run.outcomes.passed / Object.values(run.outcomes).reduce((a, b) => a + b, 0)) * 100);
                const label = run.label.replace('build ', '') + ' — ' + new Date(run.timestamp).toLocaleDateString() + ' — ' + passRate + '% pass rate';
                return html`<option value=${run.timestamp} selected=${run.timestamp === errorActiveRunTs}>${label}</option>`;
            })}
        </select>
      </div>

      <div class="grid-stats" style="margin-bottom:var(--space-md)">
        ${summaryCards.map(card => html`
          <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)">
            <div class="card-title" style="margin-bottom:0">${card.title}</div>
            <div class="card-value" style="color:${card.color};font-size:var(--font-lg)">${card.value}</div>
          </div>
        `)}
      </div>
      <div class="card" style="padding-bottom:0">
        <div style="font-size:var(--font-sm);color:var(--text-secondary);margin-bottom:var(--space-md)">
          Showing ${errorScenarios.length} ${errorScenarios.length === 1 ? 'error' : 'errors'}
        </div>
        <div ref=${errorParentRefCallback} style="max-height:calc(100vh - 380px);overflow-y:auto;position:relative">
          <div style="height:${errorVirtualizer.getTotalSize()}px;width:100%;position:relative">
            ${errorVirtualizer.getVirtualItems().map(virtualRow => {
                const item = renderItems[virtualRow.index];
                if (item.type === 'header') {
                    const topOffset = virtualRow.index === 0 ? 0 : 16;
                    return html`
                  <div style="position:absolute;top:0;left:0;width:100%;height:${ERROR_HEADER_CONTENT_HEIGHT}px;transform:translateY(${virtualRow.start + topOffset}px);background:var(--bg-surface);z-index:1;display:flex;align-items:center;gap:var(--space-sm);direction:ltr"
                       class="scenario-group-header">
                    <span>${item.icon}</span>
                    <span>${item.name}</span>
                    <span style="font-size:var(--font-xs);color:var(--text-disabled);font-weight:400">(${item.count})</span>
                  </div>
                `;
                }
                const s = item.scenario;
                return html`
                <div style="position:absolute;top:0;left:0;width:100%;height:${ERROR_ROW_HEIGHT}px;transform:translateY(${virtualRow.start}px);overflow:hidden;align-items:flex-start"
                     class="scenario-item" onClick=${() => onNavigate(scenarioUrl(s))}>
                  <div class="scenario-outcome-icon ${outcomeClass(s.outcome)}" style="width:20px;height:20px;font-size:var(--font-2xs);margin-top:2px;flex-shrink:0">${outcomeIcon(s.outcome)}</div>
                  <div class="scenario-info">
                    <div class="scenario-name">${s.name}</div>
                    <div style="font-size:var(--font-sm);color:var(--color-${outcomeClass(s.outcome)});margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.error ? s.error.message : s.outcome}</div>
                    <div class="scenario-meta">
                      <span class="scenario-source" style="direction:rtl;text-align:left;unicode-bidi:plaintext">${relativeSourcePath(s)}</span>
                    </div>
                  </div>
                  <span class="scenario-duration">${formatDuration(s.duration)}</span>
                </div>
              `;
            })}
          </div>
        </div>
      </div>
    </div>
  `;
}
