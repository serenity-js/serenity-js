import type { ReportTag } from '../../../src/cli/reporting/ReportData.js';

export interface FilterCounts {
    passed: number;
    failed: number;
    skipped: number;
}

export function computeFilterCounts(tags: ReportTag[]): FilterCounts {
    const passed = tags.filter(t => t.scenarioCount > 0 && t.failed === 0 && t.skipped === 0).length;
    const failed = tags.filter(t => t.failed > 0).length;
    const skipped = tags.filter(t => t.skipped > 0).length;
    return { passed, failed, skipped };
}

export function filterTags(tags: ReportTag[], search: string, filter: string): ReportTag[] {
    let result = tags;
    if (search) {
        const lowerSearch = search.toLowerCase();
        result = result.filter(t => t.name.toLowerCase().includes(lowerSearch));
    }
    if (filter === 'passed') {
        result = result.filter(t => t.scenarioCount > 0 && t.failed === 0 && t.skipped === 0);
    } else if (filter === 'failed') {
        result = result.filter(t => t.failed > 0);
    } else if (filter === 'skipped') {
        result = result.filter(t => t.skipped > 0);
    }
    return result;
}

export interface TagGroup {
    type: string;
    label: string;
    tags: ReportTag[];
}

export function groupTagsByType(tags: ReportTag[]): TagGroup[] {
    const tagsByType: Record<string, ReportTag[]> = {};
    for (const tag of tags) {
        const type = tag.type || 'other';
        if (!tagsByType[type]) tagsByType[type] = [];
        tagsByType[type].push(tag);
    }

    const typeOrder = Object.keys(tagsByType).sort((a, b) => {
        if (a === 'feature') return -1;
        if (b === 'feature') return 1;
        return a.localeCompare(b);
    });

    return typeOrder.map(type => {
        const groupTags = tagsByType[type];
        const sortedTags = [...groupTags].sort((a, b) => {
            const aRate = a.scenarioCount > 0 ? (a.passed / a.scenarioCount) : 0;
            const bRate = b.scenarioCount > 0 ? (b.passed / b.scenarioCount) : 0;
            return aRate - bRate;
        });
        return {
            type,
            label: type.charAt(0).toUpperCase() + type.slice(1),
            tags: sortedTags,
        };
    });
}
