/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import { DATA, formatDuration, getBrowserTag, outcomeClass, outcomeIcon, relativeSourcePath, scenarioUrl, showToast } from '../utils';
import { ActivityNode } from './ActivityNode';

const html = htm.bind(h);

// ===== Parameter Set Groups =====
function ParameterSetGroups({ parameters }) {
    const groups = useMemo(() => {
        const result = [];
        let current = null;
        for (const ps of parameters) {
            const key = (ps.name || '') + '\0' + (ps.description || '');
            if (!current || current.key !== key) {
                current = { key, name: ps.name, description: ps.description, items: [] };
                result.push(current);
            }
            current.items.push(ps);
        }
        return result;
    }, [parameters]);

    if (groups.length === 1 && !groups[0].name && !groups[0].description) {
        return html`${groups[0].items.map((ps, index) => html`<${ParameterSetNode} ps=${ps} index=${index} groupIndex=${0} forceExpanded=${undefined} />`)}`;
    }

    return html`${groups.map((group, index) => html`<${ParameterSetGroup} group=${group} index=${index} />`)}`;
}

function ParameterSetGroup({ group, index }) {
    const [expanded, setExpanded] = useState(true);
    const [forceExpanded, setForceExpanded] = useState(undefined);
    const passCount = group.items.filter(ps => ps.outcome === 'SUCCESS' || (ps.outcome && ps.outcome.code === 64)).length;
    const label = group.name || ('Examples' + (index !== undefined ? ' #' + (index + 1) : ''));
    const collapseAll = (e) => { e.stopPropagation(); setForceExpanded(false); };
    const expandAll = (e) => { e.stopPropagation(); setForceExpanded(true); };
    return html`
    <div style="margin-bottom:var(--space-md);border:1px solid var(--border-color);border-radius:var(--radius-sm);overflow:hidden">
      <div style="display:flex;align-items:center;gap:var(--space-sm);padding:var(--space-sm) var(--space-md);background:var(--bg-primary);cursor:pointer;user-select:none"
           onClick=${() => setExpanded(!expanded)}>
        <span style="font-size:var(--font-sm);transform:${expanded ? 'rotate(90deg)' : 'none'};transition:transform 0.2s">▸</span>
        <span style="font-size:var(--font-md);font-weight:600">${label}</span>
        <span style="margin-left:auto;display:flex;align-items:center;gap:var(--space-sm)">
          <button onClick=${expandAll} title="Expand all examples" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px;display:flex;opacity:0.6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M7 9l5 5 5-5"/><path d="M7 15l5 5 5-5"/></svg>
          </button>
          <button onClick=${collapseAll} title="Collapse all examples" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px;display:flex;opacity:0.6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M17 15l-5-5-5 5"/><path d="M17 9l-5-5-5 5"/></svg>
          </button>
          <span style="font-size:var(--font-xs);color:var(--text-secondary)">${passCount}/${group.items.length} passed</span>
        </span>
      </div>
      ${group.description ? html`
        <div style="padding:var(--space-xs) var(--space-md) ${expanded ? '0' : 'var(--space-xs)'};font-size:var(--font-sm);color:var(--text-secondary);font-style:italic;border-top:1px solid var(--divider)">${group.description}</div>
      ` : null}
      ${expanded ? html`
        <div style="padding:var(--space-sm) var(--space-md)">
          ${group.items.map((ps, index_) => html`<${ParameterSetNode} ps=${ps} index=${index_} groupIndex=${index} forceExpanded=${forceExpanded} />`)}
        </div>
      ` : null}
    </div>
  `;
}

// ===== Parameter Set Node =====
function ParameterSetNode({ ps, index, groupIndex, forceExpanded }) {
    const exampleId = (groupIndex !== undefined ? groupIndex + '-' : '') + (index + 1);
    const isLinked = (() => {
        const hash = window.location.hash;
        const m = hash.match(/[&?]example=([^&]*)/);
        return m && m[1] === exampleId;
    })();
    const [expanded, setExpanded] = useState(true);
    useEffect(() => { if (forceExpanded !== undefined) setExpanded(forceExpanded); }, [forceExpanded]);
    const nodeRef = useRef(null);
    const copyLink = (e) => {
        e.stopPropagation();
        const hash = window.location.hash.replace(/([&?])example=[^&]*/g, '');
        const url = window.location.origin + window.location.pathname + window.location.search + hash + (hash.includes('?') ? '&' : '?') + 'example=' + exampleId;
        navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard')).catch(() => {});
    };
    useEffect(() => { if (isLinked && nodeRef.current) nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, []);
    const parameterSummary = Object.entries(ps.values).map(([k, v]) => k + ': ' + v).join(', ');
    return html`
    <div ref=${nodeRef} style="margin-bottom:var(--space-sm);border:1px solid ${isLinked ? 'var(--accent)' : 'var(--border-color)'};border-radius:var(--radius-sm);overflow:hidden">
      <div style="display:flex;align-items:center;gap:var(--space-sm);padding:var(--space-sm) var(--space-md);background:var(--bg-primary);cursor:pointer;user-select:none"
           onClick=${() => setExpanded(!expanded)}>
        <span style="font-size:var(--font-sm);transform:${expanded ? 'rotate(90deg)' : 'none'};transition:transform 0.2s">▸</span>
        <span class="scenario-outcome-icon ${outcomeClass(ps.outcome)}" style="width:18px;height:18px;font-size:var(--font-2xs);flex-shrink:0">${outcomeIcon(ps.outcome)}</span>
        <span style="font-size:var(--font-sm);font-weight:500">#${index + 1} — ${parameterSummary}</span>
        <button onClick=${copyLink} title="Copy link to this example" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px;line-height:1;opacity:0.6;display:flex;align-items:center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        </button>
        <span style="font-size:var(--font-xs);color:var(--text-secondary)">${formatDuration(ps.duration)}</span>
      </div>
      ${expanded && ps.activities.length > 0 ? html`
        <div class="activity-tree" style="padding:var(--space-sm) var(--space-md)">
          ${ps.activities.map(activity => html`<${ActivityNode} activity=${activity} />`)}
        </div>
      ` : null}
    </div>
  `;
}

// ===== Test Scenario Detail View =====
export function ScenarioDetailView({ scenarioId, onNavigate }) {
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
        const sourceKey = s.source.path + ':' + s.source.line;
        return sourceKey === decodeURIComponent(cleanId) || s.id === cleanId;
    });
    const [activeAttempt, setActiveAttempt] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState(-1);
    const [treeKey, setTreeKey] = useState(0);
    const [treeExpanded, setTreeExpanded] = useState(true);

    useEffect(() => {
        const hash = window.location.hash;
        const photoMatch = hash.match(/&photo=(\d+)/);
        if (photoMatch) {
            const photoIndex = parseInt(photoMatch[1], 10);
            setTimeout(() => {
                const element = document.getElementById('photo-' + photoIndex);
                if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); element.classList.add('photo-highlight'); setTimeout(() => element.classList.remove('photo-highlight'), 2000); }
            }, 300);
        }
    }, []);

    if (!scenario) {
        return html`<div class="card"><p>Test scenario not found.</p></div>`;
    }

    if (!scenario.tags) scenario.tags = [];
    if (!scenario.cast) scenario.cast = [];
    if (!scenario.activities) scenario.activities = [];
    if (!scenario.executionHistory) scenario.executionHistory = [];

    const hasRetries = scenario.attempts && scenario.attempts.length > 0;
    const hasCast = scenario.cast.length > 0;
    const hasTags = scenario.tags.length > 0;
    const hasExecutionHistory = scenario.executionHistory.length > 0;
    const currentActivities = hasRetries && activeAttempt < scenario.attempts.length
        ? scenario.attempts[activeAttempt].activities
        : scenario.activities;
    const currentError = hasRetries && activeAttempt < scenario.attempts.length
        ? scenario.attempts[activeAttempt].error
        : scenario.error;
    const errorLocation = currentError ? (function findLoc(acts) { for (const a of acts) { if (a.outcome !== 'SUCCESS' && a.outcome !== 'SKIPPED' && a.location) return a.location; if (a.children) { const r = findLoc(a.children); if (r) return r; } } return null; })(currentActivities) : null;

    const copyTestPath = () => {
        const text = scenario.source.path + ':' + scenario.source.line;
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

      <div class="card" style="margin-bottom:var(--space-md)">
        <div class="scenario-detail-header">
          <div class="scenario-detail-outcome scenario-outcome-icon ${outcomeClass(scenario.outcome)}">
            ${outcomeIcon(scenario.outcome)}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:var(--space-sm)">
              <div class="scenario-detail-title" style="flex:1;min-width:0">${scenario.name}</div>
              <button onClick=${copyTestPath} title="Copy test path to clipboard" style="flex-shrink:0;width:28px;height:28px;border-radius:var(--radius-sm);border:none;background:var(--bg-hover);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              </button>
            </div>
            <div class="scenario-detail-meta">
              <span>${formatDuration(scenario.duration)}</span>
              <span>•</span>
              <span class="scenario-source">${relativeSourcePath(scenario)}</span>
              ${getBrowserTag(scenario) ? html`<span class="badge badge-${getBrowserTag(scenario)}">${getBrowserTag(scenario)}</span>` : null}
            </div>
          </div>
        </div>

        ${hasTags ? html`
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:var(--space-md)">
            ${[...new Map(scenario.tags.map(t => [t.type + ':' + t.name, t])).values()].map(t => html`<span class="tag-chip">${t.type}:${t.name}</span>`)}
          </div>
        ` : null}

        ${hasExecutionHistory ? html`
          <div style="margin-bottom:var(--space-md)">
            <div class="card-title" style="margin-bottom:var(--space-sm)">Execution History</div>
            <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">
              ${scenario.executionHistory.map((entry, index) => {
                    const isActive = runIndex === index;
                    const blockStyle = 'width:20px;height:20px;border-radius:4px;background:var(--color-' + outcomeClass(entry.outcome) + ');opacity:' + (isActive ? '1' : '0.85') + ';display:flex;align-items:center;justify-content:center;font-size:var(--font-2xs);color:#fff;font-weight:600' + (isActive ? ';box-shadow:0 0 0 2px var(--bg-surface), 0 0 0 4px var(--accent)' : '');
                    const labelStyle = 'font-size:var(--font-xs);color:' + (isActive ? 'var(--accent)' : 'var(--text-disabled)') + ';font-weight:' + (isActive ? '600' : '400');
                    const handleRunClick = (e) => { e.stopPropagation(); onNavigate(scenarioUrl(scenario) + '?run=' + (DATA.history[index] ? DATA.history[index].timestamp : index)); };
                    return html`
                <div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer"
                     title="${entry.run}: ${entry.outcome}"
                     onClick=${handleRunClick}>
                  <div style=${blockStyle}>${outcomeIcon(entry.outcome)}</div>
                  <span style=${labelStyle}>${entry.run}</span>
                </div>
              `;
                })}
            </div>
          </div>
        ` : null}

        ${scenario.narrative ? html`
          <div style="margin-bottom:var(--space-md);padding:var(--space-md);background:var(--bg-primary);border-radius:var(--radius-sm);border-left:3px solid var(--accent);font-size:var(--font-md);color:var(--text-secondary);white-space:pre-line;line-height:1.6;font-style:italic">${scenario.narrative}</div>
        ` : null}

        ${scenario.description ? html`
          <div style="margin-bottom:var(--space-md);padding:var(--space-md);background:var(--bg-primary);border-radius:var(--radius-sm);border-left:3px solid var(--border-color);font-size:var(--font-md);color:var(--text-primary);white-space:pre-line;line-height:1.6">${scenario.description}</div>
        ` : null}

        ${hasCast ? html`
          <div class="cast-section">
            <div class="card-title" style="margin-bottom:var(--space-sm)">Cast</div>
            ${scenario.cast.map(actor => html`
              <div style="margin-bottom:var(--space-md)">
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
          ${scenario.attempts.map((attempt, i) => html`
            <div class="retry-tab ${activeAttempt === i ? 'active' : ''} ${outcomeClass(attempt.outcome)}"
                 onClick=${() => setActiveAttempt(i)}>
              Attempt ${attempt.attemptNumber} (${attempt.outcome === 'SUCCESS' ? 'passed' : 'failed'})
            </div>
          `)}
        </div>
      ` : null}

      ${currentActivities.length > 0 || scenario.scenarioOutline ? html`
        <div class="card" style="margin-bottom:var(--space-md)">
          <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-sm)">
            <div class="card-title" style="margin-bottom:0">Activity Tree</div>
            <button onClick=${() => { setTreeExpanded(true); setTreeKey(k => k + 1); }} title="Expand all" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px 4px;font-size:var(--font-sm);opacity:0.7" aria-label="Expand all">▼</button>
            <button onClick=${() => { setTreeExpanded(false); setTreeKey(k => k + 1); }} title="Collapse all" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px 4px;font-size:var(--font-sm);opacity:0.7" aria-label="Collapse all">▶</button>
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
          <div class="error-name" style="display:flex;align-items:center;gap:var(--space-sm)">${currentError.name}${errorLocation ? html`<span style="margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:var(--font-xs);font-weight:400;font-family:var(--font-mono);color:var(--text-secondary)">${errorLocation.path.split('/').pop()}:${errorLocation.line}<span style="cursor:pointer;opacity:0.6;display:inline-flex;align-items:center" title="Copy location" onClick=${(e) => { e.stopPropagation(); navigator.clipboard.writeText(errorLocation.path + ':' + errorLocation.line).then(() => showToast('Location copied to clipboard')).catch(() => {}); }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></span></span>` : null}</div>
          <div class="error-message">${currentError.message}</div>
          <pre class="error-stack">${currentError.stack}</pre>
        </div>
      ` : null}

      ${scenario.video ? html`
        <div class="card" style="margin-top:var(--space-md)">
          <div class="card-title">Video Recording</div>
          <video controls preload="metadata" style="width:100%;border-radius:var(--radius-sm);margin-top:var(--space-sm)">
            <source src=${scenario.video} type="video/webm" />
          </video>
        </div>
      ` : null}

      ${(() => {
            const photos = [];
            const scenarioStart = new Date(scenario.startedAt).getTime();
            function collectPhotos(activities) {
                for (const a of activities) {
                    if (a.artifacts) {
                        for (const art of a.artifacts) {
                            if (art.path && art.path.endsWith('.png')) {
                                const actStart = a.startedAt ? new Date(a.startedAt).getTime() : scenarioStart;
                                photos.push({ path: art.path, name: a.name, wallClock: a.startedAt, offsetMs: actStart - scenarioStart });
                            }
                        }
                    }
                    if (a.children) collectPhotos(a.children);
                }
            }
            collectPhotos(currentActivities);
            if (photos.length === 0) return null;
            return html`
          <div class="card" style="margin-top:var(--space-md)">
            <div class="card-title">Screenshots (${photos.length})</div>
            <div class="photo-strip" id="photo-strip">
              ${photos.map((photo, index) => html`
                <div class="photo-strip-item" id=${'photo-' + index}>
                  <img src=${photo.path} loading="lazy" alt=${photo.name} onClick=${() => setLightboxIndex(index)} />
                  <div class="photo-strip-caption">${photo.name}</div>
                  <div class="photo-strip-time">${photo.wallClock ? new Date(photo.wallClock).toLocaleTimeString() : ''} · +${formatDuration(photo.offsetMs)}</div>
                </div>
              `)}
            </div>
          </div>
          ${lightboxIndex >= 0 && lightboxIndex < photos.length ? html`
            <div class="lightbox-overlay" onClick=${(e) => { if (e.target.classList.contains('lightbox-overlay')) setLightboxIndex(-1); }}
                 onKeyDown=${(e) => { if (e.key === 'Escape') setLightboxIndex(-1); else if (e.key === 'ArrowRight' && lightboxIndex < photos.length - 1) setLightboxIndex(lightboxIndex + 1); else if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1); }}
                 tabIndex="0" ref=${(element) => { if (element) element.focus(); }}>
              <div class="lightbox-content">
                <button class="lightbox-close" onClick=${() => setLightboxIndex(-1)}>✕</button>
                ${lightboxIndex > 0 ? html`<button class="lightbox-nav lightbox-prev" onClick=${() => setLightboxIndex(lightboxIndex - 1)}>‹</button>` : null}
                ${lightboxIndex < photos.length - 1 ? html`<button class="lightbox-nav lightbox-next" onClick=${() => setLightboxIndex(lightboxIndex + 1)}>›</button>` : null}
                <img src=${photos[lightboxIndex].path} alt=${photos[lightboxIndex].name} />
                <div class="lightbox-caption">
                  <div>${photos[lightboxIndex].name}</div>
                  <div style="font-size:var(--font-xs);color:var(--text-secondary);font-family:var(--font-mono)">${photos[lightboxIndex].wallClock ? new Date(photos[lightboxIndex].wallClock).toLocaleTimeString() : ''} · +${formatDuration(photos[lightboxIndex].offsetMs)} · ${lightboxIndex + 1}/${photos.length}</div>
                </div>
              </div>
            </div>
          ` : null}
        `;
        })()}
    </div>
  `;
}
