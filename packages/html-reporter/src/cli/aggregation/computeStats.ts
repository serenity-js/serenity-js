import { ExecutionSkipped, ExecutionSuccessful, ImplementationPending } from '@serenity-js/core/model';

import type { RunData } from '../model/RunData.js';

/**
 * @package
 */
export function computeTagStats(run: RunData): Array<{ type: string; name: string; scenarioCount: number; passed: number; failed: number; skipped: number }> {
    const tagMap = new Map<string, { type: string; name: string; scenarioCount: number; passed: number; failed: number; skipped: number }>();
    for (const scene of run.scenes) {
        for (const tag of scene.tags) {
            const key = tag.type + ':' + tag.name;
            if (!tagMap.has(key)) {
                tagMap.set(key, { type: tag.type, name: tag.name, scenarioCount: 0, passed: 0, failed: 0, skipped: 0 });
            }
            const entry = tagMap.get(key);
            entry.scenarioCount++;
            if (scene.outcome.code === ExecutionSuccessful.Code) {
                entry.passed++;
            } else if (scene.outcome.code === ExecutionSkipped.Code || scene.outcome.code === ImplementationPending.Code) {
                entry.skipped++;
            } else {
                entry.failed++;
            }
        }
    }
    return [...tagMap.values()];
}

/**
 * @package
 */
export function extractBrowsers(run: RunData): Array<{ name: string; version: string }> {
    const browsers = new Map<string, string>();
    for (const scene of run.scenes) {
        for (const tag of scene.tags) {
            if (tag.type !== 'browser') continue;

            const parts = tag.name.split(' ');
            const name = parts[0] || tag.name;
            const version = parts.slice(1).join(' ') || '';
            if (!browsers.has(name)) {
                browsers.set(name, version);
            }
        }
    }
    return [...browsers.entries()].map(([name, version]) => ({ name, version }));
}

import type { ReportSystemContext } from '../ReportData.js';

/**
 * @package
 */
export function buildSystemContext(latestRun: RunData): ReportSystemContext | undefined {
    if (!latestRun.systemContext) {
        return undefined;
    }
    return {
        nodeVersion: latestRun.systemContext.nodeVersion,
        os: latestRun.systemContext.os,
        serenityVersion: String(latestRun.systemContext.serenityVersion),
        testRunner: latestRun.testRunner || { name: 'unknown', version: '' },
        browsers: extractBrowsers(latestRun),
        ci: latestRun.systemContext.runtime,
        projectName: latestRun.systemContext.projectName,
        packageManager: latestRun.systemContext.packageManager,
        environmentUnderTest: latestRun.systemContext.environmentUnderTest,
    };
}
