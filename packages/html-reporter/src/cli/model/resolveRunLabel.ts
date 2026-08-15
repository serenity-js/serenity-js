/**
 * Resolves the display label for a test run, preferring the explicit testRunId over the startedAt timestamp.
 *
 * @internal
 */
export function resolveRunLabel(run: { testRunId?: string; startedAt: string }): string {
    return run.testRunId || run.startedAt;
}
