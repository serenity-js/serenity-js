import type { ReportScenarioRef, ReportScenarioTag, ReportSource } from '../../src/ReportData';

interface ScenarioLike extends ReportScenarioRef {
    tags?: ReportScenarioTag[];
    error?: { message?: string };
}

export function tagDiscriminator(tags?: ReportScenarioTag[]): string {
    if (!tags) return '';
    const browserTag = tags.find(t => t.type === 'browser')?.name || '';
    const projectTag = tags.find(t => t.type === 'project')?.name || '';
    const platformTag = tags.find(t => t.type === 'platform')?.name || '';
    return [browserTag, projectTag, platformTag].filter(Boolean).join('@');
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

export function matchesSearch(scenario: ScenarioLike, query: string): boolean {
    const tokens = parseSearchTokens(query);
    if (tokens.length === 0) return true;

    const tagNames = (scenario.tags || []).map(t => t.name).join(' ');
    const sourcePath = scenario.source?.path || '';
    const errorMessage = scenario.error?.message || '';
    const text = (scenario.name + ' ' + scenario.category + ' ' + tagNames + ' ' + sourcePath + ' ' + errorMessage).toLowerCase();

    return tokens.every(token => {
        if (token.startsWith('@')) {
            return matchesTagToken(scenario.tags || [], token);
        }
        return text.includes(token.toLowerCase());
    });
}

const KNOWN_TAG_TYPES = ['browser', 'project', 'platform', 'feature', 'capability', 'tag'];

function matchesTagToken(tags: ReportScenarioTag[], token: string): boolean {
    // token is e.g. "@browser", "@browser:chromium", "@browser:\"chromium 149\"", "@showcase"
    const withoutAt = token.slice(1); // remove @
    const colonIndex = withoutAt.indexOf(':');

    if (colonIndex === -1) {
        const tokenLower = withoutAt.toLowerCase();
        if (KNOWN_TAG_TYPES.includes(tokenLower)) {
            // @browser, @feature, etc. — match any tag with this exact type
            return tags.some(t => t.type.toLowerCase() === tokenLower);
        }
        // @showcase, @smoke, etc. — shorthand for @tag:value
        return tags.some(t => t.type.toLowerCase() === 'tag' && t.name.toLowerCase().includes(tokenLower));
    }

    const type = withoutAt.slice(0, colonIndex).toLowerCase();
    let value = withoutAt.slice(colonIndex + 1);
    // Strip surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
    }
    value = value.toLowerCase();

    return tags.some(t => t.type.toLowerCase() === type && t.name.toLowerCase().includes(value));
}

export function parseSearchTokens(query: string): string[] {
    const tokens: string[] = [];
    const regex = /@[^:\s]+:"[^"]*"|@\S+|"[^"]+"|(\S+)/g;
    let match;
    while ((match = regex.exec(query)) !== null) {
        let token = match[0];
        // For non-@ tokens, strip surrounding quotes
        if (!token.startsWith('@') && token.startsWith('"') && token.endsWith('"')) {
            token = token.slice(1, -1);
        }
        if (token) tokens.push(token);
    }
    return tokens;
}

export function formatTagToken(tag: { type: string; name: string }): string {
    const value = tag.name.includes(' ') ? `"${tag.name}"` : tag.name;
    // Use shorthand @value for tags of type 'tag'
    if (tag.type === 'tag') {
        return `@${value}`;
    }
    return `@${tag.type}:${value}`;
}

export function searchContainsTag(search: string, tag: { type: string; name: string }): boolean {
    const tokens = parseSearchTokens(search);
    const targetType = tag.type.toLowerCase();
    const targetName = tag.name.toLowerCase();

    return tokens.some(token => {
        if (!token.startsWith('@')) return false;
        const withoutAt = token.slice(1);
        const colonIndex = withoutAt.indexOf(':');

        if (colonIndex === -1) {
            // Shorthand @value — only matches tags of type 'tag'
            if (targetType !== 'tag') return false;
            const tokenLower = withoutAt.toLowerCase();
            // Must not be a known tag type keyword (those mean type-level filtering)
            if (KNOWN_TAG_TYPES.includes(tokenLower)) return false;
            return tokenLower === targetName;
        }

        const type = withoutAt.slice(0, colonIndex).toLowerCase();
        if (type !== targetType) return false;

        let value = withoutAt.slice(colonIndex + 1);
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        return value.toLowerCase() === targetName;
    });
}

export function toggleTagInSearch(search: string, tag: { type: string; name: string }): string {
    if (searchContainsTag(search, tag)) {
        // Remove the tag token
        const tokens = parseSearchTokens(search);
        const targetType = tag.type.toLowerCase();
        const targetName = tag.name.toLowerCase();

        const remaining = tokens.filter(token => {
            if (!token.startsWith('@')) return true;
            const withoutAt = token.slice(1);
            const colonIndex = withoutAt.indexOf(':');

            if (colonIndex === -1) {
                // Shorthand @value — only matches tags of type 'tag'
                if (targetType !== 'tag') return true;
                const tokenLower = withoutAt.toLowerCase();
                if (KNOWN_TAG_TYPES.includes(tokenLower)) return true;
                return tokenLower !== targetName;
            }

            const type = withoutAt.slice(0, colonIndex).toLowerCase();
            if (type !== targetType) return true;

            let value = withoutAt.slice(colonIndex + 1);
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            return value.toLowerCase() !== targetName;
        });

        return remaining.join(' ').trim();
    }

    // Append the tag token
    const token = formatTagToken(tag);
    return search ? (search.trim() + ' ' + token) : token;
}
