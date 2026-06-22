import { DATA } from './data';
 
type Scenario = any;

export function getBrowserTag(scenario: Scenario): string | null {
    const tag = scenario.tags.find((t: { type: string; name: string }) => t.type === 'browser');
    return tag ? tag.name : null;
}

export function relativeSourcePath(scenario: Scenario): string {
    const p = scenario.source.path;
    const specDirectory = DATA.requirements ? DATA.requirements.name : 'spec';
    const marker = '/' + specDirectory + '/';
    const index = p.indexOf(marker);
    const relativePath = index !== -1 ? p.slice(index + marker.length) : p;
    return scenario.source.line ? relativePath + ':' + scenario.source.line : relativePath;
}

export function scenarioUrl(scenario: Scenario, run?: number | string | null): string {
    const id = scenario.source.line ? scenario.source.path + ':' + scenario.source.line : scenario.source.path;
    const base = '/tests/' + encodeURIComponent(id);
    if (run === undefined || run === null) return base;
    const ts = typeof run === 'number' && DATA.history[run] ? DATA.history[run].timestamp : run;
    return base + '?run=' + ts;
}

export function matchesSearch(scenario: Scenario, query: string): boolean {
    const tagNames = (scenario.tags || []).map((t: { name: string }) => t.name).join(' ');
    const sourcePath = scenario.source?.path || '';
    const text = (scenario.name + ' ' + scenario.category + ' ' + tagNames + ' ' + sourcePath).toLowerCase();
    const tokens = parseSearchTokens(query.toLowerCase());
    return tokens.every((token: string) => text.includes(token));
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
