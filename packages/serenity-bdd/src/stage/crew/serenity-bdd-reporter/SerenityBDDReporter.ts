import { DomainEventQueues, Stage, StageCrewMember } from '@serenity-js/core';
import { ArtifactGenerated, DomainEvent, TestRunFinishes } from '@serenity-js/core/lib/events';
import { CorrelationId } from '@serenity-js/core/lib/model';

import { EventQueueProcessors } from './processors';

/**
 * A {@apilink StageCrewMember} that produces [Serenity BDD](http://serenity-bdd.info/)-standard JSON reports
 * to be parsed by [Serenity BDD CLI Reporter](https://github.com/serenity-bdd/serenity-cli)
 * to produce HTML reports and living documentation.
 *
 * ## Registering the reporter programmatically
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
 * ## Registering the reporter using WebdriverIO configuration
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
 *         ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *         new SerenityBDDReporter(),
 *     ],
 *     // other Serenity/JS config
 *   },
 *   // other Protractor config
 * }
 * ```
 *
 * ## Registering the reporter using Protractor configuration
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
 *       ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *       new SerenityBDDReporter(),
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
        }
    }

    private isSceneSpecific(event: DomainEvent): event is DomainEvent & { sceneId: CorrelationId } {
        return Object.prototype.hasOwnProperty.call(event, 'sceneId');
    }
}
