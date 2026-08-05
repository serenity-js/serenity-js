/**
 * Classifies a db.json path as run-level (pre-merged) or module-level (individual module).
 *
 * Run-level: test-runs/8334/db.json (relative path after test-runs/ has no slash)
 * Module-level: test-runs/8334/cucumber-1/db.json (relative path has a slash)
 * Worker files: test-runs/8334/cucumber-1/db-0-5.json (same as module-level)
 *
 * @returns classification result, or undefined if the path does not contain `/test-runs/`
 */
export function classifyRunPath(databaseJsonPath: string): { isRunLevel: boolean; runId: string; subDirectory: string } | undefined {
    const pathWithoutDatabase = databaseJsonPath.replace(/\/db(-[^/]+)?\.json$/, '');
    const testRunsIndex = pathWithoutDatabase.lastIndexOf('/test-runs/');

    if (testRunsIndex === -1) {
        return undefined;
    }

    const relative = pathWithoutDatabase.slice(testRunsIndex + '/test-runs/'.length);
    const slashIndex = relative.indexOf('/');
    const isRunLevel = slashIndex === -1;
    const runId = isRunLevel ? relative : relative.slice(0, slashIndex);
    const subDirectory = isRunLevel ? '.' : relative.slice(slashIndex + 1);

    return { isRunLevel, runId, subDirectory };
}
