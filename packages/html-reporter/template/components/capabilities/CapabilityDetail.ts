import htm from 'htm';
import { h } from 'preact';

import type { ReportCapabilityNode } from '../../../src/ReportData';
import { RawHtml } from '../../utils';
import { SegmentedBar } from '../charts/SegmentedBar';
import { computeNodeScore, confidenceColor } from './CapabilityTree';

const html = htm.bind(h);

const folderIcon = html`<svg class="req-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
const fileIcon = html`<svg class="req-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

export interface DetailPanelProps {
    node: ReportCapabilityNode | null;
    segmentPath: string;
    capabilities: ReportCapabilityNode;
    onNavigate: (path: string) => void;
    onSelect: (path: string, node: ReportCapabilityNode) => void;
}

export function DetailPanel({ node, segmentPath, capabilities, onNavigate, onSelect }: DetailPanelProps): ReturnType<typeof html> {
    const displayNode = node || capabilities;
    const score = computeNodeScore(displayNode);
    const total = Object.values(displayNode.outcomes).reduce((a: number, b: number) => a + b, 0);
    const failedCount = (displayNode.outcomes.failed || 0) + (displayNode.outcomes.error || 0) + (displayNode.outcomes.compromised || 0);

    const directories = displayNode.children ? displayNode.children.filter(c => c.type === 'directory') : [];
    const files = displayNode.children ? displayNode.children.filter(c => c.type === 'file') : [];

    const rootName = capabilities.name || 'features';
    const fullPath = segmentPath ? rootName + '/' + segmentPath : rootName;

    const copyPath = () => {
        navigator.clipboard.writeText(fullPath).then(() => {
            const element = document.getElementById('req-path-copied');
            if (element) { element.style.opacity = '1'; setTimeout(() => { element.style.opacity = '0'; }, 1500); }
        });
    };

    return html`
        <div class="req-detail-panel">
            <!-- Requirement header: single source of truth -->
            <div class="req-detail-header">
                <h2 class="req-detail-title">${displayNode.displayName || displayNode.name}</h2>
                <div class="req-detail-path-bar">
                    <span class="req-detail-path">${fullPath}</span>
                    <button class="req-detail-path-copy" onClick=${copyPath} title="Copy path" aria-label="Copy path to clipboard">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    </button>
                    <span id="req-path-copied" class="req-detail-path-toast">Copied!</span>
                </div>
                <div class="req-detail-summary">
                    <span class="req-detail-confidence" style="color:${confidenceColor(score.confidence)}">${score.confidence}%</span>
                    <span class="req-detail-confidence-label">confidence</span>
                    <span class="req-detail-scenario-count">${total} scenario${total !== 1 ? 's' : ''}</span>
                </div>
                ${total > 0 ? html`
                    <${SegmentedBar} outcomes=${displayNode.outcomes} className="req-detail-outcome-bar" />
                    <div class="req-detail-metrics">
                        <span class="req-detail-metric">${score.passRate}% passing</span>
                        <span class="req-detail-metric-sep">·</span>
                        <span class="req-detail-metric">${score.completeness}% complete</span>
                        <span class="req-detail-metric-sep">·</span>
                        <span class="req-detail-metric">${score.consistency}% consistent</span>
                        ${failedCount > 0 ? html`
                            <span class="req-detail-metric-sep">·</span>
                            <span class="req-detail-metric" style="color:var(--color-failed)">${failedCount} failed</span>
                        ` : null}
                    </div>
                ` : html`
                    <div class="req-detail-metrics">
                        <span class="req-detail-metric" style="color:var(--text-disabled)">No scenarios yet</span>
                    </div>
                `}
            </div>

            ${displayNode.readme ? html`<div class="readme-content"><${RawHtml} content=${displayNode.readme} /></div>` : null}

            ${files.length > 0 ? html`
                <div class="req-detail-files">
                    <h4 class="req-detail-section-title">Specs</h4>
                    ${files.map(child => {
                        const childScore = computeNodeScore(child);
                        const filePath = segmentPath + '/' + child.name;
                        return html`
                            <div class="req-detail-file-card clickable" onClick=${() => onNavigate('/tests?search=' + encodeURIComponent('"' + filePath + '"'))}>
                                <span class="req-detail-child-icon">${fileIcon}</span>
                                <span class="req-detail-child-name">${child.displayName || child.name}</span>
                                <span class="req-detail-child-health">
                                    <span class="req-detail-child-confidence" style="color:${confidenceColor(childScore.confidence)}" title="Confidence: ${childScore.confidence}%"><span class="req-tree-confidence-icon">◐</span>${childScore.confidence}%</span>
                                    <${SegmentedBar} outcomes=${child.outcomes} />
                                </span>
                            </div>
                        `;
                    })}
                </div>
            ` : null}

            ${directories.length > 0 ? html`
                <div class="req-detail-files">
                    <h4 class="req-detail-section-title">Capabilities</h4>
                    ${directories.map(child => {
                        const childScore = computeNodeScore(child);
                        const childPath = segmentPath ? segmentPath + '/' + child.name : child.name;
                        return html`
                            <div class="req-detail-file-card clickable" onClick=${() => onSelect(childPath, child)}>
                                <span class="req-detail-child-icon">${folderIcon}</span>
                                <span class="req-detail-child-name">${child.displayName || child.name}</span>
                                <span class="req-detail-child-health">
                                    <span class="req-detail-child-confidence" style="color:${confidenceColor(childScore.confidence)}" title="Confidence: ${childScore.confidence}%"><span class="req-tree-confidence-icon">◐</span>${childScore.confidence}%</span>
                                    <${SegmentedBar} outcomes=${child.outcomes} />
                                </span>
                            </div>
                        `;
                    })}
                </div>
            ` : null}
        </div>
    `;
}
