import htm from 'htm';
import { h } from 'preact';

import type { ReportCapabilityNode } from '../../../src/cli/reporting/ReportData.js';
import { naturalCompare } from '../../utils/index.js';
import { link } from '../../utils/link.js';
import { SegmentedBar } from '../common/charts/SegmentedBar.js';
import { icons } from '../common/icons.js';
import { computeNodeScore, confidenceColor, findNodeByPath } from './CapabilityTree.js';

const html = htm.bind(h);

export interface SpecsListProps {
    segmentPath: string;
    directories: ReportCapabilityNode[];
    files: ReportCapabilityNode[];
    capabilities: ReportCapabilityNode;
    onSelect: (path: string, node: ReportCapabilityNode) => void;
    onNavigate: (path: string) => void;
}

export function SpecsList({ segmentPath, directories, files, capabilities, onSelect, onNavigate }: SpecsListProps): ReturnType<typeof html> {
    return html`
        <div class="req-detail-files">
            <h4 class="req-detail-section-title">Specs</h4>
            ${segmentPath ? html`
                <div class="req-detail-file-card clickable" onClick=${() => {
                    const parentPath = segmentPath.includes('/')
                        ? segmentPath.slice(0, segmentPath.lastIndexOf('/'))
                        : '';
                    const parentNode = parentPath
                        ? findNodeByPath(capabilities, parentPath)
                        : capabilities;
                    onSelect(parentPath, parentNode || capabilities);
                }}>
                    <span class="req-detail-child-icon">${icons.folder}</span>
                    <span class="req-detail-child-name">..</span>
                </div>
            ` : null}
            ${[...directories].sort((a, b) => naturalCompare(a.displayName || a.name, b.displayName || b.name)).map(child => {
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
            ${[...files].sort((a, b) => naturalCompare(a.displayName || a.name, b.displayName || b.name)).map(child => {
                const childScore = computeNodeScore(child);
                const filePath = segmentPath + '/' + child.name;
                return html`
                    <div class="req-detail-file-card clickable" onClick=${() => onNavigate(link({ view: 'tests', search: `"${filePath}"` }))}>
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
    `;
}
