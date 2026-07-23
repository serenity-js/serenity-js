import htm from 'htm';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import type { ReportScenario } from '../../../src/cli/ReportData';

const html = htm.bind(h);

type Actor = NonNullable<ReportScenario['cast']>[number];

interface CastSectionProps {
    cast: Actor[];
}

function parseDetails(details: string): unknown {
    try {
        return JSON.parse(details);
    } catch {
        return null;
    }
}

function isEmptyObject(obj: unknown): boolean {
    if (obj === null || obj === undefined) return true;
    if (typeof obj !== 'object') return false;
    if (Array.isArray(obj)) return obj.length === 0;
    return Object.keys(obj as Record<string, unknown>).length === 0;
}

function renderDetails(obj: unknown): ReturnType<typeof html> | undefined {
    if (isEmptyObject(obj)) return undefined;
    if (typeof obj !== 'object') return html`<span>${String(obj)}</span>`;
    if (Array.isArray(obj)) {
        return html`<ul class="cast-details-list">${obj.map(item => html`<li>${renderDetails(item)}</li>`)}</ul>`;
    }
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return undefined;
    return html`<ul class="cast-details-list">
        ${entries.map(([key, value]) => {
            if (typeof value === 'object' && value !== null && !isEmptyObject(value)) {
                return html`<li><span class="cast-detail-key">${key}</span>${renderDetails(value)}</li>`;
            }
            if (isEmptyObject(value)) {
                return undefined;
            }
            return html`<li><span class="cast-detail-key">${key}:</span> ${String(value)}</li>`;
        })}
    </ul>`;
}

export function CastSection({ cast }: CastSectionProps): ReturnType<typeof html> {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const toggleActor = (name: string) => {
        setExpanded(previous => {
            const next = new Set(previous);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    return html`
        <div class="cast-section">
            <div class="card-title mb-sm">Cast</div>
            ${cast.map(actor => {
                const isExpanded = expanded.has(actor.name);
                return html`
                    <div class="mb-md">
                        <button
                            class="cast-actor-header"
                            aria-expanded=${isExpanded}
                            onClick=${() => toggleActor(actor.name)}
                        >
                            <span class="cast-chevron ${isExpanded ? 'expanded' : ''}">▶</span>
                            <div class="cast-avatar">${actor.name[0]}</div>
                            <div style="font-weight:500">${actor.name}</div>
                        </button>
                        ${isExpanded && html`
                            <div style="margin-left:36px;font-size:var(--font-sm);color:var(--text-secondary)">
                                ${actor.abilities.map(ability => {
                                    const parsed = ability.details ? parseDetails(ability.details) : null;
                                    const hasDetails = parsed !== null && !isEmptyObject(parsed);
                                    return html`
                                        <div class="cast-ability-item">
                                            <strong>${ability.name}</strong>
                                            ${hasDetails && renderDetails(parsed)}
                                        </div>
                                    `;
                                })}
                            </div>
                        `}
                    </div>
                `;
            })}
        </div>
    `;
}
