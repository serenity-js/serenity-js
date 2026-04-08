import { Question } from '@serenity-js/core';

import type { ModuleInfo } from '../abilities/UseNodeModules.js';
import { UseNodeModules } from '../abilities/UseNodeModules.js';

/**
 * A Question that returns the list of installed `@serenity-js/*` packages.
 *
 * ## Example
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core';
 * import { UseNodeModules, InstalledSerenityModules } from '@serenity-js/cli';
 *
 * const actor = actorCalled('Alice').whoCan(
 *     UseNodeModules.at(process.cwd())
 * );
 *
 * const modules = await actor.answer(InstalledSerenityModules());
 * // Returns something like:
 * // [
 * //   { name: '@serenity-js/core', version: '3.42.0', path: '/project/node_modules/@serenity-js/core' },
 * //   { name: '@serenity-js/web', version: '3.42.0', path: '/project/node_modules/@serenity-js/web' }
 * // ]
 * ```
 *
 * @group Questions
 */
export function InstalledSerenityModules(): Question<Promise<ModuleInfo[]>> {
    return Question.about('installed Serenity/JS modules', async actor => {
        const nodeModules = actor.abilityTo(UseNodeModules);
        return nodeModules.listSerenityPackages();
    });
}
