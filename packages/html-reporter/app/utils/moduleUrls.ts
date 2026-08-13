import { link } from './link.js';

/**
 * Builds a URL for filtering test scenarios by module.
 *
 * @param runId - The test run identifier
 * @param moduleId - The module identifier
 * @returns URL path with query parameters for module filtering
 */
export function buildModuleUrl(runId: string, moduleId: string): string {
    return link({ view: 'tests', run: runId, search: '@module:' + moduleId });
}

/**
 * Builds a URL for filtering test scenarios by module and outcome.
 *
 * @param runId - The test run identifier
 * @param moduleId - The module identifier
 * @param filter - The outcome filter (passed, failed, or skipped)
 * @returns URL path with query parameters for module and outcome filtering
 */
export function buildModuleOutcomeUrl(runId: string, moduleId: string, filter: 'passed' | 'failed' | 'skipped'): string {
    return link({ view: 'tests', run: runId, search: '@module:' + moduleId, filter });
}
