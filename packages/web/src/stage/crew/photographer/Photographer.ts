import { ConfigurationError, LogicError } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import { ActivityFinished, ActivityStarts } from '@serenity-js/core/lib/events';
import type { Stage, StageCrewMember } from '@serenity-js/core/lib/stage';

import * as strategies from './strategies';

/**
 * The Photographer is a {@apilink StageCrewMember} who takes screenshots
 * using the web browser associated with the {@apilink Actor} that is currently {@apilink actorInTheSpotlight|in the spotlight}.
 *
 * ## Registering Photographer programmatically
 *
 * ```ts
 * import { configure, ArtifactArchiver } from '@serenity-js/core'
 * import { Photographer, TakePhotosOfFailures } from '@serenity-js/web'
 *
 * configure({
 *   crew: [
 *     ArtifactArchiver.storingArtifactsAt(process.cwd(), 'target/site/serenity'),
 *     Photographer.whoWill(TakePhotosOfFailures),
 *   ]
 * })
 * ```
 *
 * ## Using Photographer with Playwright Test
 *
 * ```ts
 * // playwright.config.ts
 * import type { PlaywrightTestConfig } from '@serenity-js/playwright-test'
 *
 * const config: PlaywrightTestConfig = {
 *   reporter: [
 *       [ '@serenity-js/playwright-test', {
 *           crew: [
 *               '@serenity-js/serenity-bdd',
 *               [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
 *           ]
 *           // other Serenity/JS config
 *       }]
 *   ],
 *
 *   use: {
 *     crew: [
 *       [ '@serenity-js/web:Photographer', {
 *         strategy: 'TakePhotosOfFailures',
 *         // strategy: 'TakePhotosOfInteractions',
 *       } ]
 *     ],
 *   },
 * };
 * export default config;
 * ```
 *
 * #### Learn more
 * - {@apilink SerenityOptions}
 *
 * ## Using Photographer with WebdriverIO
 *
 * ```ts
 * // wdio.conf.ts
 * import { ArtifactArchiver } from '@serenity-js/core'
 * import { WebdriverIOConfig } from '@serenity-js/webdriverio'
 *
 * export const config: WebdriverIOConfig= {
 *
 *   // Tell WebdriverIO to use Serenity/JS framework
 *   framework: '@serenity-js/webdriverio',
 *
 *   serenity: {
 *     // Configure Serenity/JS to use an appropriate test runner adapter
 *     runner: 'cucumber',
 *     // runner: 'mocha',
 *     // runner: 'jasmine',
 *
 *     // register custom Actors class to configure your Serenity/JS actors
 *     actors: new Actors(),
 *
 *     // Register StageCrewMembers we've imported at the top of this file
 *     crew: [
 *       '@serenity-js/serenity-bdd',
 *       [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
 *       [ '@serenity-js/web:Photographer', {
 *         strategy: 'TakePhotosOfFailures',
 *         // strategy: 'TakePhotosOfInteractions',
 *       } ]
 *     ]
 *   },
 *
 *   // ... rest of the config omitted for brevity
 * }
 * ```
 *
 * ## Using Photographer with Protractor
 *
 * ```ts
 * // protractor.conf.js
 * exports.config = {
 *
 *   // Tell Protractor to use the Serenity/JS framework Protractor Adapter
 *   framework:      'custom',
 *   frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),
 *
 *   serenity: {
 *     runner: 'jasmine',
 *     // runner: 'cucumber',
 *     // runner: 'mocha',
 *     crew: [
 *       @serenity-js/serenity-bdd',
 *        '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
 *        '@serenity-js/web:Photographer', {
 *          strategy: 'TakePhotosOfFailures',
 *          // strategy: 'TakePhotosOfInteractions',
 *        ]
 *     ]
 *   },
 *
 *   // ... rest of the config omitted for brevity
 * }
 * ```
 *
 * ## Taking photos only upon failures only
 *
 * ```ts
 * import { Photographer, TakePhotosOfFailures } from '@serenity-js/web'
 *
 * Photographer.whoWill(TakePhotosOfFailures)
 * ```
 *
 * ## Taking photos of all the interactions
 *
 * ```ts
 * import { Photographer, TakePhotosOfInteractions } from '@serenity-js/web'
 *
 * Photographer.whoWill(TakePhotosOfInteractions)
 * ```
 *
 * ## Taking photos before and after all the interactions
 *
 * ```ts
 * import { Photographer, TakePhotosBeforeAndAfterInteractions } from '@serenity-js/web'
 *
 * Photographer.whoWill(TakePhotosBeforeAndAfterInteractions)
 * ```
 *
 * ## Learn more
 * - {@apilink Stage}
 * - {@apilink StageCrewMember}
 * - {@apilink TakePhotosBeforeAndAfterInteractions}
 * - {@apilink TakePhotosOfFailures}
 * - {@apilink TakePhotosOfInteractions}
 *
 * @group Stage
 */
export class Photographer implements StageCrewMember {

    /**
     * Instantiates a new {@apilink Photographer} configured to take photos (screenshots)
     * as per the specified {@apilink PhotoTakingStrategy}.
     *
     * @param strategy
     *  A no-arg constructor function that instantiates a {@apilink PhotoTakingStrategy}
     */
    static whoWill(strategy: new () => strategies.PhotoTakingStrategy): StageCrewMember {
        return new Photographer(new strategy());
    }

    /**
     * Instantiates a new {@apilink Photographer} configured to take photos (screenshots)
     * as per the specified {@apilink PhotoTakingStrategy}.
     *
     * @param config
     */
    static fromJSON(config?: { strategy?: Omit<keyof typeof strategies, 'PhotoTakingStrategy'> }): StageCrewMember {
        if (config && config.strategy) {
            const availableStrategies = Object.keys(strategies).filter(strategy => strategy !== strategies.PhotoTakingStrategy.name)    // not the abstract class

            if (availableStrategies.includes(config.strategy as string)) {
                return new Photographer(new strategies[config.strategy as string]());
            }

            throw new ConfigurationError(
                `'${ config.strategy }' is not an available PhotoTakingStrategy, ` +
                `available strategies: ${ availableStrategies.join(', ') }.`
            );
        }

        return new Photographer(new strategies.TakePhotosOfFailures());
    }

    constructor(
        private readonly photoTakingStrategy: strategies.PhotoTakingStrategy,
        private stage?: Stage,
    ) {
    }

    /**
     * Assigns this {@apilink StageCrewMember} to a given {@apilink Stage}.
     *
     * @param stage
     *  An instance of a {@apilink Stage} this {@apilink StageCrewMember} will be assigned to
     */
    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    /**
     * Handles {@apilink DomainEvent} objects emitted by the {@apilink Stage}
     * this {@apilink StageCrewMember} is assigned to.
     *
     * @param event
     */
    notifyOf(event: DomainEvent): void {
        if (! this.stage) {
            throw new LogicError(`Photographer needs to be assigned to the Stage before it can be notified of any DomainEvents`);
        }

        if (! this.stage.theShowHasStarted()) {
            return void 0;
        }

        if (event instanceof ActivityStarts || event instanceof ActivityFinished) {
            this.photoTakingStrategy.considerTakingPhoto(event, this.stage);
        }
    }
}
