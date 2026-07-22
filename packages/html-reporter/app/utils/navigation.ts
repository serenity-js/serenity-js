import type { ReportScenarioTag, ReportSource } from '../../src/cli/ReportData';

export function tagDiscriminator(tags?: ReportScenarioTag[]): string {
    if (!tags) return '';
    const browserTag = tags.find(t => t.type === 'browser')?.name || '';
    const projectTag = tags.find(t => t.type === 'project')?.name || '';
    const platformTag = tags.find(t => t.type === 'platform')?.name || '';
    return [browserTag, projectTag, platformTag].filter(Boolean).join('@');
}

export function getBrowserTag(scenario: { tags?: Array<{ type: string; name: string }> }): string | null {
    const tag = (scenario.tags || []).find(t => t.type === 'browser');
    return tag ? tag.name : null;
}

export function browserBadgeClass(browserTag: string): string {
    const name = browserTag.split(/[\s.]/)[0].toLowerCase();
    if (name === 'chrome' || name === 'chromium') return 'badge-chromium';
    if (name === 'firefox' || name === 'gecko') return 'badge-firefox';
    if (name === 'webkit' || name === 'safari') return 'badge-webkit';
    return 'badge-browser';
}

export function relativeSourcePath(scenario: { source: ReportSource; name: string }, specDirectory?: string): string {
    const relativePath = stripAbsolutePrefix(scenario.source.path, specDirectory);
    return scenario.source.line ? relativePath + ':' + scenario.source.line : relativePath;
}

export function relativeLocationPath(location: { path: string; line: number; column?: number }, specDirectory?: string): string {
    const relativePath = stripAbsolutePrefix(location.path, specDirectory);
    return relativePath + ':' + location.line;
}

function stripAbsolutePrefix(filePath: string, specDirectory?: string): string {
    if (!specDirectory) {
        return filePath;
    }

    const marker = '/' + specDirectory + '/';
    const index = filePath.indexOf(marker);
    if (index !== -1) {
        return filePath.slice(index + marker.length);
    }

    return filePath;
}

export function scenarioUrl(scenario: { source: ReportSource; name: string; tags?: ReportScenarioTag[] }, run?: number | string | null, history?: Array<{ timestamp: string }>): string {
    const id = scenario.source.line
        ? scenario.source.path + ':' + scenario.source.line
        : scenario.source.path + ':' + scenario.name;
    const base = '/tests/' + encodeURIComponent(id);
    const params = new URLSearchParams();
    if (run !== undefined && run !== null) {
        const historyArray = history || [];
        const ts = typeof run === 'number' && historyArray[run] ? historyArray[run].timestamp : String(run);
        params.set('run', ts);
    }
    // Include all discriminator tags to uniquely identify cross-browser/project/platform variations
    const tags = scenario.tags || [];
    const browserTag = tags.find(t => t.type === 'browser');
    const projectTag = tags.find(t => t.type === 'project');
    const platformTag = tags.find(t => t.type === 'platform');
    if (browserTag) params.set('browser', browserTag.name);
    if (projectTag) params.set('project', projectTag.name);
    if (platformTag) params.set('platform', platformTag.name);
    const qs = params.toString();
    return qs ? base + '?' + qs : base;
}
