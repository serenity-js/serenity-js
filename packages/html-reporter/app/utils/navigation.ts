import { tagDiscriminator as serverTagDiscriminator } from '../../src/cli/model/sceneIdentity.js';
import type { ReportScenarioTag, ReportSource } from '../../src/cli/ReportData';
import { link } from './link.js';

/**
 * Returns a discriminator string from browser, project, and platform tags.
 * Delegates to the server-side implementation to avoid duplication.
 * 
 * @param tags - Optional array of tags
 * @returns Discriminator string (e.g., "chromium@mobile@darwin") or empty string
 */
export function tagDiscriminator(tags?: ReportScenarioTag[]): string {
    if (!tags) return '';
    return serverTagDiscriminator(tags);
}

/**
 * Extracts a tag value by type from a scenario.
 * 
 * @param scenario - Scenario or object with tags
 * @param type - Tag type to extract (e.g., 'browser', 'project', 'platform')
 * @returns Tag value or null if not found
 */
export function getTagByType(
    scenario: { tags?: Array<{ type: string; name: string }> },
    type: string
): string | null {
    const tag = (scenario.tags || []).find(t => t.type === type);
    return tag ? tag.name : null;
}

/**
 * Extracts the browser tag from a scenario.
 * 
 * @param scenario - Scenario with optional tags
 * @returns Browser name (e.g., "chromium 149") or null
 */
export function getBrowserTag(scenario: { tags?: Array<{ type: string; name: string }> }): string | null {
    return getTagByType(scenario, 'browser');
}

export function browserBadgeClass(browserTag: string): string {
    const name = browserTag.split(/[\s.]/)[0].toLowerCase();
    if (name === 'chrome' || name === 'chromium') return 'badge-chromium';
    if (name === 'firefox' || name === 'gecko') return 'badge-firefox';
    if (name === 'webkit' || name === 'safari') return 'badge-webkit';
    return 'badge-browser';
}

/**
 * Formats a scenario source location as a relative path with line number.
 * 
 * @param scenario - Scenario with source location
 * @param specDirectory - Spec directory name
 * @returns Formatted path (e.g., "auth.spec.ts:42")
 */
export function relativeSourcePath(scenario: { source: ReportSource; name: string }, specDirectory?: string): string {
    const relativePath = stripAbsolutePrefix(scenario.source.path, specDirectory);
    return scenario.source.line ? relativePath + ':' + scenario.source.line : relativePath;
}

/**
 * Formats an activity location as a relative path with line number.
 * 
 * @param location - Location with path and line
 * @param specDirectory - Spec directory name
 * @returns Formatted path (e.g., "Click.ts:20")
 */
export function relativeLocationPath(location: { path: string; line: number; column?: number }, specDirectory?: string): string {
    const relativePath = stripAbsolutePrefix(location.path, specDirectory);
    return relativePath + ':' + location.line;
}

/**
 * Strips the spec directory prefix from a file path for display purposes.
 * Uses a marker-based approach to find the spec directory anywhere in the path.
 * 
 * @param filePath - Full file path
 * @param specDirectory - Spec directory name (e.g., "spec", "test")
 * @returns Relative path from spec directory
 * 
 * @example
 * stripAbsolutePrefix('/project/spec/auth.spec.ts', 'spec')
 * // → 'auth.spec.ts'
 * 
 * @package
 */
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
    
    // Determine run ID
    let runId: string | undefined;
    if (run !== undefined && run !== null) {
        const historyArray = history || [];
        runId = typeof run === 'number' && historyArray[run] ? historyArray[run].timestamp : String(run);
    }
    
    // Extract discriminator tags
    const tags = scenario.tags || [];
    const browserTag = tags.find(t => t.type === 'browser');
    const projectTag = tags.find(t => t.type === 'project');
    const platformTag = tags.find(t => t.type === 'platform');
    
    return link({
        view: 'tests',
        path: id,
        run: runId,
        browser: browserTag?.name,
        project: projectTag?.name,
        platform: platformTag?.name,
    });
}
