import htm from 'htm';
import { h } from 'preact';

import { DATA } from '../utils';
import { icons } from './icons';

const html = htm.bind(h);

export function SystemContextView(): ReturnType<typeof html> {
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

    const testRunner = context.testRunner || {};
    const operatingSystem = context.os || {};
    const browsers = context.browsers || [];
    const ci = context.ci;

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
            <div class="context-value">${testRunner.name} ${testRunner.version}</div>
          </div>
        </div>
        <div class="context-item">
          <div class="context-icon">🖥</div>
          <div>
            <div class="context-label">Operating System</div>
            <div class="context-value">${operatingSystem.name} ${operatingSystem.version} (${operatingSystem.arch})</div>
          </div>
        </div>
        <div class="context-item">
          <div class="context-icon">📦</div>
          <div>
            <div class="context-label">Serenity/JS</div>
            <div class="context-value">v${context.serenityVersion}</div>
          </div>
        </div>
        ${browsers.map(b => html`
          <div class="context-item">
            <div class="context-icon">🌐</div>
            <div>
              <div class="context-label">${b.name}</div>
              <div class="context-value">${b.version}</div>
            </div>
          </div>
        `)}
      </div>

      ${ci ? html`
        <div style="margin-top:var(--space-xl)">
          <div class="card-title mb-md">CI / CD</div>
          <div class="context-grid">
            <div class="context-item">
              <div class="context-icon">🏗</div>
              <div>
                <div class="context-label">Provider</div>
                <div class="context-value">${ci.provider}</div>
              </div>
            </div>
            <div class="context-item">
              <div class="context-icon">#</div>
              <div>
                <div class="context-label">Build</div>
                <div class="context-value">${ci.jobUrl
                        ? html`<a href=${ci.jobUrl} class="context-link" target="_blank" rel="noopener">#${ci.buildNumber}</a>`
                        : html`#${ci.buildNumber}`
                }</div>
              </div>
            </div>
            <div class="context-item">
              <div class="context-icon">🌿</div>
              <div>
                <div class="context-label">Branch</div>
                <div class="context-value">${ci.repositoryUrl && ci.branch
                        ? html`<a href="${ci.repositoryUrl}/tree/${ci.branch}" class="context-link" target="_blank" rel="noopener">${ci.branch}</a>`
                        : ci.branch
                }</div>
              </div>
            </div>
            <div class="context-item context-item--wide">
              <div class="context-icon">📝</div>
              <div style="min-width:0">
                <div class="context-label">Commit</div>
                <div class="context-value context-value--commit">${ci.repositoryUrl && ci.commit
                        ? html`<a href="${ci.repositoryUrl}/commit/${ci.commit}" class="context-link context-link--mono" target="_blank" rel="noopener">${ci.commit}</a>`
                        : html`<span class="context-link--mono">${ci.commit}</span>`
                }${ci.commitMessage ? html`<span class="context-commit-msg"> — ${ci.commitMessage}</span>` : null}</div>
              </div>
            </div>
          </div>
          ${ci.pullRequestUrl ? html`
            <div style="margin-top:var(--space-md)">
              <a href=${ci.pullRequestUrl} class="context-link" target="_blank" rel="noopener">
                View Pull Request #${ci.pullRequestNumber}
              </a>
            </div>
          ` : null}
        </div>
      ` : null}
    </div>
  `;
}
