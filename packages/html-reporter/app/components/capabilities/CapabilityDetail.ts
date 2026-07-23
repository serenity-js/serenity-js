import htm from 'htm';
import { h } from 'preact';

import type { ReportCapabilityNode } from '../../../src/cli/ReportData';
import { RawHtml, totalFailedCount } from '../../utils';
import { SegmentedBar } from '../common/charts/SegmentedBar';
import { icons } from '../common/icons';
import { computeNodeScore, confidenceColor } from './CapabilityTree';

const html = htm.bind(h);

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
    const failedCount = totalFailedCount(displayNode.outcomes);

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
                        ${icons.copy}
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
                                <span class="req-detail-child-icon">${icons.file}</span>
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
                                <span class="req-detail-child-icon">${icons.folder}</span>
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
