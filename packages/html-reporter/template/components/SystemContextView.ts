/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import htm from 'htm';
import { h } from 'preact';

import { DATA } from '../utils';
import { icons } from './icons';

const html = htm.bind(h);

export function SystemContextView() {
    const context = DATA.systemContext;

    if (!context) {
        return html`
      <div class="placeholder-view">
        ${icons.system}
        <h2>System Context</h2>
        <p>System context information is not yet available.<br/>It will be populated once the reporter collects environment metadata.</p>
      </div>
    `;
    }

    return html`
    <div class="card">
      <div class="card-title" style="margin-bottom:var(--space-lg)">Environment</div>
      <div class="context-grid">
        <div class="context-item">
          <div class="context-icon">⚡</div>
          <div>
            <div class="context-label">Node.js</div>
            <div class="context-value">${context.nodeVersion}</div>
          </div>
        </div>
        <div class="context-item">
          <div class="context-icon">🧪</div>
          <div>
            <div class="context-label">Test Runner</div>
            <div class="context-value">${context.testRunner.name} ${context.testRunner.version}</div>
          </div>
        </div>
        <div class="context-item">
          <div class="context-icon">🖥</div>
          <div>
            <div class="context-label">Operating System</div>
            <div class="context-value">${context.os.name} ${context.os.version} (${context.os.arch})</div>
          </div>
        </div>
        <div class="context-item">
          <div class="context-icon">📦</div>
          <div>
            <div class="context-label">Serenity/JS</div>
            <div class="context-value">v${context.serenityVersion}</div>
          </div>
        </div>
        ${context.browsers.map(b => html`
          <div class="context-item">
            <div class="context-icon">🌐</div>
            <div>
              <div class="context-label">${b.name}</div>
              <div class="context-value">${b.version}</div>
            </div>
          </div>
        `)}
      </div>

      ${context.ci ? html`
        <div style="margin-top:var(--space-xl)">
          <div class="card-title" style="margin-bottom:var(--space-md)">CI / CD</div>
          <div class="context-grid">
            <div class="context-item">
              <div class="context-icon">🏗</div>
              <div>
                <div class="context-label">Provider</div>
                <div class="context-value">${context.ci.provider}</div>
              </div>
            </div>
            <div class="context-item">
              <div class="context-icon">#</div>
              <div>
                <div class="context-label">Build</div>
                <div class="context-value">#${context.ci.buildNumber}</div>
              </div>
            </div>
            <div class="context-item">
              <div class="context-icon">🌿</div>
              <div>
                <div class="context-label">Branch</div>
                <div class="context-value">${context.ci.branch}</div>
              </div>
            </div>
            <div class="context-item">
              <div class="context-icon">📝</div>
              <div>
                <div class="context-label">Commit</div>
                <div class="context-value" style="font-family:var(--font-mono);font-size:var(--font-sm)">${context.ci.commit} — ${context.ci.commitMessage}</div>
              </div>
            </div>
          </div>
        </div>
      ` : null}
    </div>
  `;
}
