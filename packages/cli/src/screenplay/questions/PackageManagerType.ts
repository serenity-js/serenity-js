import { Question } from '@serenity-js/core';

import { UseNodeModules } from '../abilities/UseNodeModules.js';

/**
 * The type of package manager detected in the project.
 *
 * @group Model
 */
export type PackageManager = 'npm' | 'yarn' | 'pnpm';

/**
 * A Question that detects the package manager used in the project
 * by checking for lock files.
 *
 * Detection priority (first match wins):
 * 1. pnpm-lock.yaml → pnpm
 * 2. yarn.lock → yarn
 * 3. package-lock.json → npm
 * 4. Default → npm
 *
 * ## Example
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core';
 * import { UseNodeModules, PackageManagerType } from '@serenity-js/cli';
 *
 * const actor = actorCalled('Alice').whoCan(
 *     UseNodeModules.at(process.cwd())
 * );
 *
 * const packageManager = await actor.answer(PackageManagerType());
 * console.log(packageManager); // 'npm', 'yarn', or 'pnpm'
 * ```
 *
 * @group Questions
 */
export function PackageManagerType(): Question<Promise<PackageManager>> {
    return Question.about('package manager type', async actor => {
        const nodeModules = actor.abilityTo(UseNodeModules);

        // Check for pnpm first (highest priority)
        if (await fileExists(nodeModules, 'pnpm-lock.yaml')) {
            return 'pnpm';
        }

        // Check for yarn
        if (await fileExists(nodeModules, 'yarn.lock')) {
            return 'yarn';
        }

        // Check for npm
        if (await fileExists(nodeModules, 'package-lock.json')) {
            return 'npm';
        }

        // Default to npm
        return 'npm';
    });
}

async function fileExists(nodeModules: UseNodeModules, filename: string): Promise<boolean> {
    try {
        await nodeModules.fileExists(filename);
        return true;
    }
    catch {
        return false;
    }
}
