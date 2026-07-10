import type { ReportScenarioRef, ReportScenarioTag, ReportSource } from '../../src/ReportData';

interface ScenarioLike extends ReportScenarioRef {
    tags?: ReportScenarioTag[];
    error?: { message?: string };
}

export function getBrowserTag(scenario: ScenarioLike): string | null {
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
    const p = scenario.source.path;
    const directory = specDirectory || 'spec';
    const marker = '/' + directory + '/';
    const index = p.indexOf(marker);
    const relativePath = index !== -1 ? p.slice(index + marker.length) : p;
    return scenario.source.line ? relativePath + ':' + scenario.source.line : relativePath;
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
    // Use browser or project tag to differentiate cross-browser/cross-project variations
    const tags = scenario.tags || [];
    const browserTag = tags.find(t => t.type === 'browser');
    const projectTag = tags.find(t => t.type === 'project');
    if (browserTag) {
        params.set('browser', browserTag.name);
    } else if (projectTag) {
        params.set('project', projectTag.name);
    }
    const qs = params.toString();
    return qs ? base + '?' + qs : base;
}

export function matchesSearch(scenario: ScenarioLike, query: string): boolean {
    const tagNames = (scenario.tags || []).map(t => t.name).join(' ');
    const sourcePath = scenario.source?.path || '';
    const errorMessage = scenario.error?.message || '';
    const text = (scenario.name + ' ' + scenario.category + ' ' + tagNames + ' ' + sourcePath + ' ' + errorMessage).toLowerCase();
    const tokens = parseSearchTokens(query.toLowerCase());
    return tokens.every(token => text.includes(token));
}

function parseSearchTokens(query: string): string[] {
    const tokens: string[] = [];
    const regex = /"([^"]+)"|(\S+)/g;
    let match;
    while ((match = regex.exec(query)) !== null) {
        const token = match[1] || match[2].replace(/"/g, '');
        if (token) tokens.push(token);
    }
    return tokens;
}
