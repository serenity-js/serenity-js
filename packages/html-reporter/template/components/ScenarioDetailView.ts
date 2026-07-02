import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import type { ReportActivity } from '../../src/ReportData';
import { ansiToHtml, browserBadgeClass, DATA, formatDuration, formatRunLabel, getBrowserTag, outcomeClass, outcomeIcon, RawHtml, relativeSourcePath, scenarioUrl, showToast } from '../utils';
import { ActivityNode } from './ActivityNode';
import { ExecutionHistory } from './scenario/ExecutionHistory';
import { ParameterSetGroups } from './scenario/ParameterSetGroups';
import { PhotoStrip } from './scenario/PhotoStrip';

const html = htm.bind(h);

// ===== Test Scenario Detail View =====
interface ScenarioDetailViewProps {
    scenarioId: string;
    onNavigate: (path: string) => void;
}

export function ScenarioDetailView({ scenarioId, onNavigate }: ScenarioDetailViewProps): ReturnType<typeof html> {
    const cleanId = scenarioId.split('?')[0];
    const params = scenarioId.includes('?') ? new URLSearchParams(scenarioId.split('?')[1]) : null;
    const runString = params?.get('run');
    const runIndex = useMemo(() => {
        if (runString === null || runString === undefined) return null;
        const byTs = DATA.history.findIndex(r => r.timestamp === runString);
        if (byTs >= 0) return byTs;
        const parsed = parseInt(runString, 10);
        return isNaN(parsed) ? null : parsed;
    }, [runString]);

    const scenario = DATA.scenarios.find(s => {
        const sourceKey = s.source.line
            ? s.source.path + ':' + s.source.line
            : s.source.path + ':' + s.name;
        return sourceKey === decodeURIComponent(cleanId) || s.id === cleanId;
    });
    const [activeAttempt, setActiveAttempt] = useState(0);
    const [treeKey, setTreeKey] = useState(0);
    const [treeExpanded, setTreeExpanded] = useState(true);

    // Reset attempt selection when switching between runs
    useEffect(() => { setActiveAttempt(0); }, [runIndex]);

    if (!scenario) {
        return html`<div class="card"><p>Test scenario not found.</p></div>`;
    }

    if (!scenario.tags) scenario.tags = [];
    if (!scenario.cast) scenario.cast = [];
    if (!scenario.activities) scenario.activities = [];
    if (!scenario.executionHistory) scenario.executionHistory = [];

    const historicalEntry = runIndex !== null && runIndex !== DATA.history.length - 1 && scenario.executionHistory[runIndex]
        ? scenario.executionHistory[runIndex] : null;

    // Determine per-run retry state: when viewing a historical run, use its data
    const activeAttempts = historicalEntry
        ? (historicalEntry.attempts || null)
        : (scenario.attempts || null);
    const hasRetries = activeAttempts && activeAttempts.length > 0;
    const activeDuration = historicalEntry && historicalEntry.duration != null
        ? historicalEntry.duration
        : scenario.duration;
    const hasCast = scenario.cast.length > 0;
    const hasTags = scenario.tags.length > 0;
    const hasExecutionHistory = scenario.executionHistory.length > 0;
    const currentActivities = historicalEntry && historicalEntry.activities
        ? (hasRetries && activeAttempt < activeAttempts.length
            ? activeAttempts[activeAttempt].activities
            : historicalEntry.activities)
        : hasRetries && activeAttempt < activeAttempts.length
            ? activeAttempts[activeAttempt].activities
            : scenario.activities;
    const currentError = historicalEntry
        ? (hasRetries && activeAttempt < activeAttempts.length
            ? activeAttempts[activeAttempt].error
            : historicalEntry.error || null)
        : hasRetries && activeAttempt < activeAttempts.length
            ? activeAttempts[activeAttempt].error
            : scenario.error;
    const errorLocation = currentError ? (function findLoc(acts: ReportActivity[]): { path: string; line: number; column: number } | null { for (const a of acts) { if (a.outcome !== 'SUCCESS' && a.outcome !== 'SKIPPED' && a.location) return a.location; if (a.children) { const r = findLoc(a.children); if (r) return r; } } return null; })(currentActivities) : null;

    const copyTestPath = () => {
        const text = scenario.source.line ? scenario.source.path + ':' + scenario.source.line : scenario.source.path;
        navigator.clipboard.writeText(text).then(() => showToast('Path copied to clipboard')).catch(() => {});
    };

    return html`
    <div>
      <div class="breadcrumb">
        <a onClick=${() => onNavigate('/tests' + (runIndex !== null && DATA.history[runIndex] ? '?run=' + DATA.history[runIndex].timestamp : ''))}>Test Scenarios</a>
        ${scenario.category.split(' › ').map((segment) => html`
          <span>›</span>
          <a onClick=${() => onNavigate('/tests?search=' + encodeURIComponent('"' + segment + '"'))}>${segment}</a>
        `)}
        <span>›</span>
        <span>${scenario.name}</span>
      </div>

      ${runIndex !== null && runIndex !== DATA.history.length - 1 && DATA.history[runIndex] ? html`
        <div class="historical-banner">
          <span>Viewing results from: <strong>${formatRunLabel(DATA.history[runIndex].label, DATA.history[runIndex].timestamp)}</strong></span>
          <a onClick=${() => onNavigate(scenarioUrl(scenario))} style="cursor:pointer;color:var(--accent);font-weight:500;text-decoration:underline">show latest</a>
        </div>
      ` : null}

      <div class="card mb-md">
        <div class="scenario-detail-header">
          <div class="scenario-detail-outcome scenario-outcome-icon ${outcomeClass(scenario.outcome)}">
            ${outcomeIcon(scenario.outcome)}
          </div>
          <div class="flex-1">
            <div class="flex-row gap-sm">
              <div class="scenario-detail-title flex-1">${scenario.name}</div>
              <button onClick=${copyTestPath} title="Copy test path to clipboard" style="flex-shrink:0;width:28px;height:28px;border-radius:var(--radius-sm);border:none;background:var(--bg-hover);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              </button>
            </div>
            <div class="scenario-detail-meta">
              <span>${formatDuration(activeDuration)}</span>
              <span>•</span>
              <span class="scenario-source">${relativeSourcePath(scenario, DATA.capabilities ? DATA.capabilities.name : undefined)}</span>
              ${getBrowserTag(scenario) ? html`<span class="badge ${browserBadgeClass(getBrowserTag(scenario)!)}">${getBrowserTag(scenario)}</span>` : null}
            </div>
          </div>
        </div>

        ${hasTags ? html`
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:var(--space-md)">
            ${[...new Map(scenario.tags.map(t => [t.type + ':' + t.name, t])).values()].map(t => html`<span class="tag-chip">${t.type}:${t.name}</span>`)}
          </div>
        ` : null}

        ${hasExecutionHistory ? html`
          <${ExecutionHistory} scenario=${scenario} runIndex=${runIndex} history=${DATA.history} onNavigate=${onNavigate} />
        ` : null}

        ${scenario.narrative ? html`
          <div class="req-detail-readme readme-content" style="margin-bottom:var(--space-md)"><${RawHtml} content=${scenario.narrative} /></div>
        ` : null}

        ${hasCast ? html`
          <div class="cast-section">
            <div class="card-title mb-sm">Cast</div>
            ${scenario.cast.map(actor => html`
              <div class="mb-md">
                <div class="cast-item">
                  <div class="cast-avatar">${actor.name[0]}</div>
                  <div style="font-weight:500">${actor.name}</div>
                </div>
                <div style="margin-left:36px;font-size:var(--font-sm);color:var(--text-secondary)">
                  <div style="margin-bottom:2px;font-weight:500;color:var(--text-primary)">${actor.name} can:</div>
                  <ul style="list-style:disc;padding-left:var(--space-md);margin:0">
                    ${actor.abilities.map(ability => html`
                      <li style="margin-bottom:2px;font-family:${ability.details ? 'var(--font-mono)' : 'inherit'};font-size:${ability.details ? '11px' : '12px'}">
                        <strong>${ability.name}</strong>${ability.details ? html`<span style="color:var(--text-disabled)"> ${ability.details}</span>` : null}
                      </li>
                    `)}
                  </ul>
                </div>
              </div>
            `)}
          </div>
        ` : null}
      </div>

      ${hasRetries ? html`
        <div class="retry-tabs">
          ${activeAttempts.map((attempt, i) => html`
            <div class="retry-tab ${activeAttempt === i ? 'active' : ''} ${outcomeClass(attempt.outcome)}"
                 onClick=${() => setActiveAttempt(i)}>
              Attempt ${attempt.attemptNumber} (${attempt.outcome === 'SUCCESS' ? 'passed' : 'failed'})
            </div>
          `)}
        </div>
      ` : null}

      ${currentActivities.length > 0 || scenario.scenarioOutline ? html`
        <div class="card mb-md">
          ${scenario.description ? html`
            <div class="req-detail-readme readme-content" style="margin-bottom:var(--space-md)"><${RawHtml} content=${scenario.description} /></div>
          ` : null}
          <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-sm)">
            <div class="card-title mb-0">Activity Tree</div>
            ${!scenario.scenarioOutline && currentActivities.some(a => a.children && a.children.length > 0) ? html`
              <button onClick=${() => { setTreeExpanded(true); setTreeKey(k => k + 1); }} title="Expand all" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px 4px;font-size:var(--font-sm);opacity:0.7" aria-label="Expand all">▼</button>
              <button onClick=${() => { setTreeExpanded(false); setTreeKey(k => k + 1); }} title="Collapse all" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px 4px;font-size:var(--font-sm);opacity:0.7" aria-label="Collapse all">▶</button>
            ` : null}
          </div>
          ${scenario.scenarioOutline ? html`
            <div style="margin-bottom:var(--space-md);padding:var(--space-sm) var(--space-md);background:var(--bg-primary);border-radius:var(--radius-sm);font-family:var(--font-mono);font-size:var(--font-sm);white-space:pre-line;color:var(--text-secondary)">${scenario.scenarioOutline.template}</div>
            <${ParameterSetGroups} parameters=${scenario.scenarioOutline.parameters} />
          ` : html`
            <div class="activity-tree" key=${treeKey}>
              ${currentActivities.map(activity => html`<${ActivityNode} activity=${activity} defaultExpanded=${treeExpanded} />`)}
            </div>
          `}
        </div>
      ` : null}

      ${currentError ? html`
        <div class="error-block">
          <div class="error-name" style="display:flex;align-items:center;gap:var(--space-sm)">${currentError.name}${errorLocation ? html`<span style="margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:var(--font-xs);font-weight:400;font-family:var(--font-mono);color:var(--text-secondary)">${errorLocation.path.split('/').pop()}:${errorLocation.line}<span style="cursor:pointer;opacity:0.6;display:inline-flex;align-items:center" title="Copy location" onClick=${(e: Event) => { e.stopPropagation(); navigator.clipboard.writeText(errorLocation!.path + ':' + errorLocation!.line).then(() => showToast('Location copied to clipboard')).catch(() => {}); }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></span></span>` : null}</div>
          <div class="error-message" dangerouslySetInnerHTML=${{ __html: ansiToHtml(currentError.message) }}></div>
          <pre class="error-stack" dangerouslySetInnerHTML=${{ __html: ansiToHtml(currentError.stack || '') }}></pre>
        </div>
      ` : null}

      ${scenario.video ? html`
        <div class="card mt-md">
          <div class="card-title">Video Recording</div>
          <video controls preload="metadata" style="width:100%;border-radius:var(--radius-sm);margin-top:var(--space-sm)">
            <source src=${scenario.video} type="video/webm" />
          </video>
        </div>
      ` : null}

      <${PhotoStrip} activities=${currentActivities} scenarioStartedAt=${scenario.startedAt} />
    </div>
  `;
}
