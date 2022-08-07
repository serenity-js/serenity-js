import { LogicError } from '@serenity-js/core';
import { ActivityFinished, ActivityStarts, DomainEvent } from '@serenity-js/core/lib/events';
import { Stage, StageCrewMember } from '@serenity-js/core/lib/stage';

import { PhotoTakingStrategy } from './strategies';

/**
 * The Photographer is a {@link StageCrewMember} who takes screenshots
 * using the web browser associated with the {@link Actor} that is currently {@link actorInTheSpotlight|in the spotlight}.
 *
 * ## Programmatically assigning the `Photographer` to the {@link Stage}
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
 * ## Using `Photographer` with WebdriverIO
 *
 * ```ts
 * // wdio.conf.ts
 * import { ArtifactArchiver } from '@serenity-js/core'
 * import { Photographer, TakePhotosOfFailures } from '@serenity-js/web'
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
 *       ArtifactArchiver.storingArtifactsAt(process.cwd(), 'target/site/serenity'),
 *       Photographer.whoWill(TakePhotosOfFailures),
 *     ]
 *   },
 *
 *   // ... rest of the config omitted for brevity
 * }
 * ```
 *
 * ## Using `Photographer` with Protractor
 *
 * ```ts
 * // protractor.conf.js
 * const { ArtifactArchiver } = require('@serenity-js/core')
 * const { Photographer, TakePhotosOfFailures } = require('@serenity-js/web')
 *
 * exports.config = {
 *
 *   // Tell Protractor to use the Serenity/JS framework Protractor Adapter
 *   framework:      'custom',
 *   frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),
 *
 *   serenity: {
 *         runner: 'jasmine',
 *         // runner: 'cucumber',
 *         // runner: 'mocha',
 *         crew: [
 *             ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *             Photographer.whoWill(TakePhotosOfFailures),
 *         ]
 *     },
 *
 *     // ... rest of the config omitted for brevity
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
 * - {@link Stage}
 * - {@link StageCrewMember}
 * - {@link TakePhotosBeforeAndAfterInteractions}
 * - {@link TakePhotosOfFailures}
 * - {@link TakePhotosOfInteractions}
 *
 * @group Stage
 */
export class Photographer implements StageCrewMember {

    /**
     * Instantiates a new {@link Photographer} configured to take photos (screenshots)
     * as per the specified {@link PhotoTakingStrategy}.
     *
     * @param strategy
     * A no-arg constructor function that instantiates a {@link PhotoTakingStrategy}
     */
    static whoWill(strategy: new () => PhotoTakingStrategy): StageCrewMember {
        return new Photographer(new strategy());
    }

    constructor(
        private readonly photoTakingStrategy: PhotoTakingStrategy,
        private stage?: Stage,
    ) {
    }

    /**
     * Assigns this {@link StageCrewMember} to a given {@link Stage}.
     *
     * @param stage
     *  An instance of a {@link Stage} this {@link StageCrewMember} will be assigned to
     */
    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    /**
     * Handles {@link DomainEvent} objects emitted by the {@link Stage}
     * this {@link StageCrewMember} is assigned to.
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
