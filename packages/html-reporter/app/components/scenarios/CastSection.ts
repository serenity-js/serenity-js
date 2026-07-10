import htm from 'htm';
import { h } from 'preact';

import type { ReportScenario } from '../../../src/cli/ReportData';

const html = htm.bind(h);

type Actor = NonNullable<ReportScenario['cast']>[number];

interface CastSectionProps {
    cast: Actor[];
}

export function CastSection({ cast }: CastSectionProps): ReturnType<typeof html> {
    return html`
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
    `;
}
