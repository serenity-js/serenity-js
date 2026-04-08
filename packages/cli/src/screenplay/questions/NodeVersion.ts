import { Question } from '@serenity-js/core';
import * as semver from 'semver';

/**
 * The supported Node.js version range for Serenity/JS.
 *
 * @group Questions
 */
export const SUPPORTED_NODE_RANGE = '^20 || ^22 || ^24';

/**
 * Checks if the given Node.js version is supported by Serenity/JS.
 *
 * @param version - The Node.js version string (e.g., 'v20.0.0' or '20.0.0')
 * @returns true if the version is supported, false otherwise
 *
 * @group Questions
 */
export function isNodeVersionSupported(version: string): boolean {
    const cleanVersion = version.startsWith('v') ? version.slice(1) : version;
    return semver.satisfies(cleanVersion, SUPPORTED_NODE_RANGE);
}

/**
 * A Question that returns the current Node.js version.
 *
 * ## Example
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core';
 * import { NodeVersion } from '@serenity-js/cli';
 *
 * const version = await actorCalled('Alice').answer(NodeVersion());
 * // Returns something like 'v22.11.0'
 * ```
 *
 * @group Questions
 */
export function NodeVersion(): Question<Promise<string>> {
    return Question.about('Node.js version', () =>
        Promise.resolve(process.version)
    );
}
