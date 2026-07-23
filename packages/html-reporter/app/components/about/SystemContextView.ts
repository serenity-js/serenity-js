import htm from 'htm';
import { h } from 'preact';

import type { ReportSystemContext } from '../../../src/cli/ReportData';
import { icons } from '../common/icons';

const html = htm.bind(h);

interface SystemContextViewProps {
    systemContext?: ReportSystemContext;
}

function ContextItem({ icon, label, value, wide }: { icon: string; label: string; value: ReturnType<typeof html>; wide?: boolean }): ReturnType<typeof html> {
    return html`
      <div class="context-item${wide ? ' context-item--wide' : ''}">
        <div class="context-icon">${icon}</div>
        <div style=${wide ? 'min-width:0' : ''}>
          <div class="context-label">${label}</div>
          <div class="context-value${wide ? ' context-value--commit' : ''}">${value}</div>
        </div>
      </div>
    `;
}

export function SystemContextView({ systemContext }: SystemContextViewProps): ReturnType<typeof html> {
    const context = systemContext;

    if (!context) {
        return html`
      <div class="placeholder-view">
        ${icons.system}
        <h2>System Context</h2>
        <p>System context information is not yet available.<br/>It will be populated once the reporter collects environment metadata.</p>
      </div>
    `;
    }

    const testRunner = context.testRunner || { name: '', version: '' };
    const operatingSystem = context.os || { name: '', version: '', arch: '' };
    const browsers = context.browsers || [];
    const ci = context.ci;

    return html`
    <div class="card">
      <div class="card-title" style="margin-bottom:var(--space-lg)">Environment</div>
      <div class="context-grid">
        <${ContextItem} icon="⚡" label="Node.js" value=${context.nodeVersion} />
        <${ContextItem} icon="🧪" label="Test Runner" value="${testRunner.name} ${testRunner.version}" />
        <${ContextItem} icon="🖥" label="Operating System" value="${operatingSystem.name} ${operatingSystem.version} (${operatingSystem.arch})" />
        <${ContextItem} icon="📦" label="Serenity/JS" value="v${context.serenityVersion}" />
        ${browsers.map(b => html`<${ContextItem} icon="🌐" label=${b.name} value=${b.version} />`)}
      </div>

      ${ci ? html`
        <div style="margin-top:var(--space-xl)">
          <div class="card-title mb-md">CI / CD</div>
          <div class="context-grid">
            <${ContextItem} icon="🏗" label="Provider" value=${ci.provider} />
            <${ContextItem} icon="#" label="Build" value=${ci.jobUrl
                ? html`<a href=${ci.jobUrl} class="context-link" target="_blank">#${ci.buildNumber}</a>`
                : html`#${ci.buildNumber}`
            } />
            <${ContextItem} icon="🌿" label="Branch" value=${ci.repositoryUrl && ci.branch
                ? html`<a href="${ci.repositoryUrl}/tree/${ci.branch}" class="context-link" target="_blank">${ci.branch}</a>`
                : ci.branch
            } />
            <${ContextItem} icon="📝" label="Commit" wide=${true} value=${html`${ci.repositoryUrl && ci.commit
                ? html`<a href="${ci.repositoryUrl}/commit/${ci.commit}" class="context-link context-link--mono" target="_blank">${ci.commit.slice(0, 7)}</a>`
                : html`<span class="context-link--mono">${ci.commit.slice(0, 7)}</span>`
            }${ci.commitMessage ? html`<span class="context-commit-msg"> — ${ci.commitMessage}</span>` : null}`} />
            ${ci.pullRequestUrl ? html`<${ContextItem} icon="🔀" label="Pull Request" value=${html`<a href=${ci.pullRequestUrl} class="context-link" target="_blank">#${ci.pullRequestNumber}</a>`} />` : null}
          </div>
        </div>
      ` : null}
    </div>
  `;
}
