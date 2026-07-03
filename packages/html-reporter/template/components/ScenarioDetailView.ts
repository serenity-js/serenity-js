import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import type { ReportActivity, ReportHistoryEntry, ReportScenario } from '../../src/ReportData';
import { ansiToHtml, browserBadgeClass, formatDuration, formatRunLabel, getBrowserTag, outcomeClass, outcomeIcon, RawHtml, relativeSourcePath, resolveRunIndex, scenarioUrl, showToast, useHashHistory } from '../utils';
import { ActivityNode } from './ActivityNode';
import { icons } from './icons';
import { ExecutionHistory } from './scenario/ExecutionHistory';
import { ParameterSetGroups } from './scenario/ParameterSetGroups';
import { PhotoStrip } from './scenario/PhotoStrip';

const html = htm.bind(h);

// ===== Test Scenario Detail View =====
interface ScenarioDetailViewProps {
    scenarios: ReportScenario[];
    history: ReportHistoryEntry[];
    specDirectory?: string;
    scenarioId: string;
    onNavigate: (path: string) => void;
}

export function ScenarioDetailView({ scenarios, history, specDirectory, scenarioId, onNavigate }: ScenarioDetailViewProps): ReturnType<typeof html> {
    const hashNav = useHashHistory();
    const cleanId = scenarioId.split('?')[0];
    const params = scenarioId.includes('?') ? new URLSearchParams(scenarioId.split('?')[1]) : null;
    const runString = params?.get('run');
    const attemptString = params?.get('attempt');
    const runIndex = useMemo(() => resolveRunIndex(runString ?? null, history), [runString]);

    const projectString = params?.get('project');
    const browserString = params?.get('browser');

    const scenario = scenarios.find(s => {
        const sourceKey = s.source.line
            ? s.source.path + ':' + s.source.line
            : s.source.path + ':' + s.name;
        const idMatch = sourceKey === decodeURIComponent(cleanId) || s.id === cleanId;
        if (!idMatch) return false;
        if (browserString) {
            return (s.tags || []).some(t => t.type === 'browser' && t.name === browserString);
        }
        if (projectString) {
            return (s.tags || []).some(t => t.type === 'project' && t.name === projectString);
        }
        return true;
    });
    const [activeAttempt, setActiveAttempt] = useState(() => {
        if (attemptString) {
            const parsed = parseInt(attemptString, 10);
            return isNaN(parsed) ? 0 : parsed - 1; // URL uses 1-based, state is 0-based
        }
        return 0;
    });
    const [treeKey, setTreeKey] = useState(0);
    const [treeExpanded, setTreeExpanded] = useState(true);

    // Reset attempt selection when switching between runs (skip initial mount)
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        setActiveAttempt(0);
        hashNav.deleteParam('attempt');
    }, [runIndex]);

    // Sync attempt selection from URL (for deep linking)
    useEffect(() => {
        if (attemptString) {
            const parsed = parseInt(attemptString, 10);
            if (!isNaN(parsed) && parsed - 1 !== activeAttempt) {
                setActiveAttempt(parsed - 1);
            }
        }
    }, [attemptString]);

    if (!scenario) {
        return html`<div class="card"><p>Test scenario not found.</p></div>`;
    }

    const tags = scenario.tags || [];
    const cast = scenario.cast || [];
    const activities = scenario.activities || [];
    const executionHistory = scenario.executionHistory || [];

    const historicalEntry = runIndex !== null && runIndex !== history.length - 1 && executionHistory[runIndex]
        ? executionHistory[runIndex] : null;

    // Determine per-run retry state: when viewing a historical run, use its data
    const activeAttempts = historicalEntry
        ? (historicalEntry.attempts || null)
        : (scenario.attempts || null);
    const hasRetries = activeAttempts && activeAttempts.length > 0;
    const activeDuration = historicalEntry && historicalEntry.duration != null
        ? historicalEntry.duration
        : scenario.duration;
    const hasCast = cast.length > 0;
    const hasTags = tags.length > 0;
    const hasExecutionHistory = executionHistory.length > 0;

    // Resolve which activities/error/video to display based on historical entry and retry state
    const activeAttemptData = hasRetries && activeAttempt < activeAttempts.length
        ? activeAttempts[activeAttempt]
        : null;

    const currentActivities = activeAttemptData
        ? activeAttemptData.activities
        : historicalEntry && historicalEntry.activities
            ? historicalEntry.activities
            : activities;

    const currentError = activeAttemptData
        ? (activeAttemptData.error || null)
        : historicalEntry
            ? (historicalEntry.error || null)
            : (scenario.error || null);

    const currentVideo = activeAttemptData
        ? (activeAttemptData.video || undefined)
        : scenario.video;

    const errorLocation = currentError ? (function findLoc(acts: ReportActivity[]): { path: string; line: number; column: number } | null { for (const a of acts) { if (a.outcome !== 'SUCCESS' && a.outcome !== 'SKIPPED' && a.location) return a.location; if (a.children) { const r = findLoc(a.children); if (r) return r; } } return null; })(currentActivities) : null;

    const copyTestPath = () => {
        const text = scenario.source.line ? scenario.source.path + ':' + scenario.source.line : scenario.source.path;
        navigator.clipboard.writeText(text).then(() => showToast('Path copied to clipboard')).catch(() => {});
    };

    return html`
    <div>
      <div class="breadcrumb">
        <a onClick=${() => onNavigate('/tests' + (runIndex !== null && history[runIndex] ? '?run=' + history[runIndex].timestamp : ''))}>Test Scenarios</a>
        ${scenario.category.split(' › ').map((segment) => html`
          <span>›</span>
          <a onClick=${() => onNavigate('/tests?search=' + encodeURIComponent('"' + segment + '"'))}>${segment}</a>
        `)}
        <span>›</span>
        <span>${scenario.name}</span>
      </div>

      ${runIndex !== null && runIndex !== history.length - 1 && history[runIndex] ? html`
        <div class="historical-banner">
          <span>Viewing results from: <strong>${formatRunLabel(history[runIndex].label, history[runIndex].timestamp)}</strong></span>
          <a onClick=${() => onNavigate(scenarioUrl(scenario))} class="link-underline">show latest</a>
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
              <button onClick=${copyTestPath} title="Copy test path to clipboard" class="copy-btn">
                ${icons.copy}
              </button>
            </div>
            <div class="scenario-detail-meta">
              <span>${formatDuration(activeDuration)}</span>
              <span>•</span>
              <span class="scenario-source">${relativeSourcePath(scenario, specDirectory)}</span>
              ${getBrowserTag(scenario) ? html`<span class="badge ${browserBadgeClass(getBrowserTag(scenario)!)}">${getBrowserTag(scenario)}</span>` : null}
            </div>
          </div>
        </div>

        ${hasTags ? html`
          <div class="flex-row flex-wrap gap-sm mb-md" style="gap:6px">
            ${[...new Map(tags.map(t => [t.type + ':' + t.name, t])).values()].map(t => html`<span class="tag-chip">${t.type}:${t.name}</span>`)}
          </div>
        ` : null}

        ${hasExecutionHistory ? html`
          <${ExecutionHistory} scenario=${scenario} runIndex=${runIndex} history=${history} onNavigate=${onNavigate} />
        ` : null}

        ${scenario.narrative ? html`
          <div class="req-detail-readme readme-content mb-md"><${RawHtml} content=${scenario.narrative} /></div>
        ` : null}

        ${hasCast ? html`
          <div class="cast-section">
            <div class="card-title mb-sm">Cast</div>
            ${cast.map(actor => html`
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
                 onClick=${() => { setActiveAttempt(i); hashNav.setParam('attempt', String(i + 1)); }}>
              Attempt ${attempt.attemptNumber} (${attempt.outcome === 'SUCCESS' ? 'passed' : 'failed'})
            </div>
          `)}
        </div>
      ` : null}

      ${currentActivities.length > 0 || scenario.scenarioOutline ? html`
        <div class="card mb-md">
          ${scenario.description ? html`
            <div class="req-detail-readme readme-content mb-md"><${RawHtml} content=${scenario.description} /></div>
          ` : null}
          <div class="flex-row gap-sm mb-sm">
            <div class="card-title mb-0">Activity Tree</div>
            ${!scenario.scenarioOutline && currentActivities.some(a => a.children && a.children.length > 0) ? html`
              <button onClick=${() => { setTreeExpanded(true); setTreeKey(k => k + 1); }} title="Expand all" class="icon-btn-sm" aria-label="Expand all">▼</button>
              <button onClick=${() => { setTreeExpanded(false); setTreeKey(k => k + 1); }} title="Collapse all" class="icon-btn-sm" aria-label="Collapse all">▶</button>
            ` : null}
          </div>
          ${scenario.scenarioOutline ? html`
            <div class="mb-md panel-section font-mono text-sm" style="background:var(--bg-primary);border-radius:var(--radius-sm);white-space:pre-line;color:var(--text-secondary)">${scenario.scenarioOutline.template}</div>
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
          <div class="error-name flex-row gap-sm">${currentError.name}${errorLocation ? html`<span class="ml-auto inline-flex-center text-xs font-mono text-secondary" style="font-weight:400">${errorLocation.path.split('/').pop()}:${errorLocation.line}<span class="copy-location" title="Copy location" onClick=${(e: Event) => { e.stopPropagation(); navigator.clipboard.writeText(errorLocation!.path + ':' + errorLocation!.line).then(() => showToast('Location copied to clipboard')).catch(() => {}); }}>${icons.copy}</span></span>` : null}</div>
          <div class="error-message" dangerouslySetInnerHTML=${{ __html: ansiToHtml(currentError.message) }}></div>
          <pre class="error-stack" dangerouslySetInnerHTML=${{ __html: ansiToHtml(currentError.stack || '') }}></pre>
        </div>
      ` : null}

      ${currentVideo ? html`
        <div class="card mt-md">
          <div class="card-title">Video Recording</div>
          <video controls preload="metadata" style="width:100%;border-radius:var(--radius-sm);margin-top:var(--space-sm)" key=${currentVideo}>
            <source src=${currentVideo} type="video/webm" />
          </video>
        </div>
      ` : null}

      <${PhotoStrip} activities=${currentActivities} scenarioStartedAt=${scenario.startedAt} />
    </div>
  `;
}
