import type { ReportScenario, ReportScenarioTag } from '../../src/cli/reporting/ReportData.js';

function browserName(tag: string | null): string | null {
    if (!tag) return null;
    const spaceIndex = tag.indexOf(' ');
    return spaceIndex === -1 ? tag : tag.slice(0, spaceIndex);
}

function filterByTags(scenarios: ReportScenario[], browserString: string | null, projectString: string | null, platformString: string | null, relaxBrowser: boolean): ReportScenario[] {
    const matchesTag = (tags: ReportScenarioTag[], type: string, value: string | null): boolean =>
        !value || tags.some(t => t.type === type && t.name === value);

    const matchesBrowser = (tags: ReportScenarioTag[], value: string | null): boolean => {
        if (!value) return true;
        return relaxBrowser
            ? tags.some(t => t.type === 'browser' && browserName(t.name) === browserName(value))
            : tags.some(t => t.type === 'browser' && t.name === value);
    };

    return scenarios.filter(s => {
        const tags = s.tags || [];
        return matchesBrowser(tags, browserString)
            && matchesTag(tags, 'project', projectString)
            && matchesTag(tags, 'platform', platformString);
    });
}

export function parseScenarioParameters(scenarioId: string): {
    cleanId: string;
    runString: string | null;
    attemptString: string | null;
    projectString: string | null;
    browserString: string | null;
    platformString: string | null;
} {
    const cleanId = scenarioId.split('?')[0];
    const params = scenarioId.includes('?') ? new URLSearchParams(scenarioId.split('?')[1]) : null;
    return {
        cleanId,
        runString: params?.get('run') ?? null,
        attemptString: params?.get('attempt') ?? null,
        projectString: params?.get('project') ?? null,
        browserString: params?.get('browser') ?? null,
        platformString: params?.get('platform') ?? null,
    };
}

export function findMatchingScenario(
    scenarios: ReportScenario[], cleanId: string, projectString: string | null, browserString: string | null, platformString: string | null,
): ReportScenario | null {
    const decoded = decodeURIComponent(cleanId);

    const findById = (candidates: ReportScenario[]): ReportScenario | undefined =>
        candidates.find(s => s.id === decoded)
        ?? candidates.find(s => {
            const sourceKey = s.source.line
                ? s.source.path + ':' + s.source.line
                : s.source.path + ':' + s.name;
            return sourceKey === decoded;
        });

    // Try exact tag match first, then fall back to browser-name-only matching
    // to handle version drift between CI runs, bookmarked URLs, and consistency card links
    const exactCandidates = filterByTags(scenarios, browserString, projectString, platformString, false);
    const relaxedCandidates = browserString
        ? filterByTags(scenarios, browserString, projectString, platformString, true)
        : [];

    return findById(exactCandidates)
        ?? findById(relaxedCandidates)
        ?? null;
}
