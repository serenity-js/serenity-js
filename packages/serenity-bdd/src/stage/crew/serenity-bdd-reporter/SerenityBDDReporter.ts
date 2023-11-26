import type { DomainEventQueue, Stage, StageCrewMember } from '@serenity-js/core';
import { DomainEventQueues } from '@serenity-js/core';
import type {DomainEvent} from '@serenity-js/core/lib/events';
import { ActivityRelatedArtifactGenerated,ArtifactGenerated, AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, SceneFinished, TestRunFinishes } from '@serenity-js/core/lib/events';
import type { Outcome } from '@serenity-js/core/lib/model';
import { CorrelationId, Description, Name } from '@serenity-js/core/lib/model';
import { match } from 'tiny-types';

import { EventQueueProcessors } from './processors';

/**
 * A {@apilink StageCrewMember} that produces [Serenity BDD](http://serenity-bdd.info/)-standard JSON reports
 * to be parsed by [Serenity BDD CLI Reporter](https://github.com/serenity-bdd/serenity-cli)
 * to produce HTML reports and living documentation.
 *
 * ## Registering Serenity BDD Reporter programmatically
 *
 * ```ts
 * import { ArtifactArchiver, configure } from '@serenity-js/core';
 * import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
 *
 * configure({
 *   crew: [
 *     ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *     new SerenityBDDReporter()
 *   ],
 * })
 * ```
 *
 * ## Using Serenity BDD Reporter with Playwright Test
 *
 * ```ts
 * // playwright.config.ts
 * import { devices } from '@playwright/test';
 * import type { PlaywrightTestConfig } from '@serenity-js/playwright-test';
 *
 * const config: PlaywrightTestConfig = {
 *
 *   reporter: [
 *     [ 'line' ],
 *     [ 'html', { open: 'never' } ],
 *     [ '@serenity-js/playwright-test', {
 *       crew: [
 *         '@serenity-js/serenity-bdd',
 *         [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
 *       ]
 *     }]
 *   ],
 * }
 * ```
 *
 * ## Using Serenity BDD Reporter with WebdriverIO
 *
 * ```ts
 * // wdio.conf.ts
 * import { ArtifactArchiver } from '@serenity-js/core';
 * import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
 * import { WebdriverIOConfig } from '@serenity-js/webdriverio';
 *
 * export const config: WebdriverIOConfig = {
 *
 *   framework: '@serenity-js/webdriverio',
 *
 *   serenity: {
 *     crew: [
 *       '@serenity-js/serenity-bdd',
 *        [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
 *     ],
 *     // other Serenity/JS config
 *   },
 *   // other Protractor config
 * }
 * ```
 *
 * ## Using Serenity BDD Reporter with Protractor
 *
 * ```js
 * // protractor.conf.js
 * const
 *   { ArtifactArchiver }    = require('@serenity-js/core'),
 *   { SerenityBDDReporter } = require('@serenity-js/serenity-bdd')
 *
 * exports.config = {
 *   framework:     'custom',
 *   frameworkPath: require.resolve('@serenity-js/protractor/adapter'),
 *
 *   serenity: {
 *     crew: [
 *         '@serenity-js/serenity-bdd',
 *          [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
 *     ],
 *     // other Serenity/JS config
 *   },
 *
 *   // other Protractor config
 * }
 * ```
 *
 * @group Stage
 */
export class SerenityBDDReporter implements StageCrewMember {
    private readonly eventQueues = new DomainEventQueues();
    private readonly processors = new EventQueueProcessors();

    /**
     * @param [stage=undefined] stage
     */
    constructor(private stage?: Stage) {
    }

    /**
     * @inheritDoc
     */
    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    /**
     * @inheritDoc
     */
    notifyOf(event: DomainEvent): void {

        if (this.isSceneSpecific(event)) {
            this.eventQueues.enqueue(event);
        }

        else if (event instanceof TestRunFinishes) {
            const outcome = this.eventQueues.forEach( (q) => this.getOutcome(q));
            this.eventQueues.forEach( (q) => this.announcePhotos(q));
            const id = CorrelationId.create();

            this.stage.announce(new AsyncOperationAttempted(
                new Name(this.constructor.name),
                new Description(`Generating Serenity BDD JSON reports...`),
                id,
                this.stage.currentTime(),
            ));

            try {
                this.processors
                    .process(this.eventQueues)
                    .forEach(result => {
                        this.stage.announce(new ArtifactGenerated(
                            result.sceneId,
                            result.name,
                            result.artifact,
                            this.stage.currentTime(),
                        ));
                    });

                this.stage.announce(new AsyncOperationCompleted(
                    id,
                    this.stage.currentTime(),
                ));
            }
            catch (error) {
                this.stage.announce(new AsyncOperationFailed(
                    error,
                    id,
                    this.stage.currentTime(),
                ));
            }
        }
    }

    private isSceneSpecific(event: DomainEvent): event is DomainEvent & { sceneId: CorrelationId } {
        return Object.prototype.hasOwnProperty.call(event, 'sceneId');
    }

    private getOutcome(queue: DomainEventQueue) : Outcome {
        const outcome = queue.reduce((result, event) =>
            match<DomainEvent, Outcome>(event)
            .when(SceneFinished, _ => (event as SceneFinished).outcome)
            .else(() => result),
        // eslint-disable-next-line unicorn/no-useless-undefined
        undefined
        );
        return outcome
    }

    private announcePhotos(queue: DomainEventQueue) : any {
        const x = queue.reduce((result, event) =>
            match<DomainEvent, string>(event)
            .when(ActivityRelatedArtifactGenerated,
                _ => this.onPhotoGenerated(event as ActivityRelatedArtifactGenerated))
            .else(() => result),
        // eslint-disable-next-line unicorn/no-useless-undefined
        undefined
        );
        return x;
    }

    private onPhotoGenerated(event: ActivityRelatedArtifactGenerated) : string {
        const id = CorrelationId.create();

        this.stage.announce(new AsyncOperationAttempted(
            new Name(this.constructor.name),
            new Description(`Generating Serenity BDD JSON reports...`),
            id,
            this.stage.currentTime(),
        ));

        try {
            this.processors

            this.stage.announce(new ArtifactGenerated(
                event.sceneId,
                event.name,
                event.artifact,
                event.timestamp
            ));

            this.stage.announce(new AsyncOperationCompleted(
                id,
                this.stage.currentTime(),
            ));
        }
        catch (error) {
            this.stage.announce(new AsyncOperationFailed(
                error,
                id,
                this.stage.currentTime(),
            ));
        }
    
        return 'x'
    }

    private onSceneFinished(event: SceneFinished) : Outcome {
        return event.outcome;
    }
}
