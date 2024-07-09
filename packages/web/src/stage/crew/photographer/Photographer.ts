import { ConfigurationError, LogicError } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import { ActivityFinished, ActivityStarts } from '@serenity-js/core/lib/events';
import type { Stage, StageCrewMember } from '@serenity-js/core/lib/stage';

import * as strategies from './strategies';

/**
 * The Photographer is a [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/) who takes screenshots
 * using the web browser associated with the [actor](https://serenity-js.org/api/core/class/Actor/) that is
 * currently [in the spotlight](https://serenity-js.org/api/core/function/actorInTheSpotlight/).
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
 * - [`SerenityOptions`](https://serenity-js.org/api/playwright-test/interface/SerenityOptions/)
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
 * - [`Stage`](https://serenity-js.org/api/core/class/Stage/)
 * - [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/)
 * - [`TakePhotosBeforeAndAfterInteractions`](https://serenity-js.org/api/web/class/TakePhotosBeforeAndAfterInteractions/)
 * - [`TakePhotosOfFailures`](https://serenity-js.org/api/web/class/TakePhotosOfFailures/)
 * - [`TakePhotosOfInteractions`](https://serenity-js.org/api/web/class/TakePhotosOfInteractions/)
 *
 * @group Stage
 */
export class Photographer implements StageCrewMember {

    /**
     * Instantiates a new [`Photographer`](https://serenity-js.org/api/web/class/Photographer/) configured to take photos (screenshots)
     * as per the specified [`PhotoTakingStrategy`](https://serenity-js.org/api/web/class/PhotoTakingStrategy/).
     *
     * @param strategy
     *  A no-arg constructor function that instantiates a [`PhotoTakingStrategy`](https://serenity-js.org/api/web/class/PhotoTakingStrategy/)
     */
    static whoWill(strategy: new () => strategies.PhotoTakingStrategy): StageCrewMember {
        return new Photographer(new strategy());
    }

    /**
     * Instantiates a new [`Photographer`](https://serenity-js.org/api/web/class/Photographer/) configured to take photos (screenshots)
     * as per the specified [`PhotoTakingStrategy`](https://serenity-js.org/api/web/class/PhotoTakingStrategy/).
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
     * Assigns this [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/) to a given [`Stage`](https://serenity-js.org/api/core/class/Stage/).
     *
     * @param stage
     *  An instance of a [`Stage`](https://serenity-js.org/api/core/class/Stage/) this [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/) will be assigned to
     */
    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    /**
     * Handles [`DomainEvent`](https://serenity-js.org/api/core-events/class/DomainEvent/) objects emitted by the [`Stage`](https://serenity-js.org/api/core/class/Stage/)
     * this [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/) is assigned to.
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
