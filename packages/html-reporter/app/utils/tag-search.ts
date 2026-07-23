import type { ReportScenarioRef, ReportScenarioTag } from '../../src/cli/ReportData';

interface ScenarioLike extends ReportScenarioRef {
    tags?: ReportScenarioTag[];
    error?: { message?: string };
}

const KNOWN_TAG_TYPES = ['browser', 'project', 'platform', 'feature', 'capability', 'tag'];

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
    const token = `@${tag.type}:${value}`;
    // When the type contains a space, quote the entire token so parseSearchTokens
    // treats it as a single unit rather than splitting on whitespace
    if (tag.type.includes(' ')) {
        return `"${token}"`;
    }
    return token;
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
        return removeTagFromSearch(search, tag);
    }
    // Append the tag token
    const token = formatTagToken(tag);
    return search ? (search.trim() + ' ' + token) : token;
}

function removeTagFromSearch(search: string, tag: { type: string; name: string }): string {
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

    return remaining.map(t => t.includes(' ') ? `"${t}"` : t).join(' ').trim();
}
