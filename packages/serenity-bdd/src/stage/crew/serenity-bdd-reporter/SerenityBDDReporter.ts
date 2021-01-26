import { Stage, StageCrewMember } from '@serenity-js/core';
import { ArtifactGenerated, DomainEvent, TestRunFinishes } from '@serenity-js/core/lib/events';
import { CorrelationId } from '@serenity-js/core/lib/model';

import { EventQueueProcessors, EventQueues } from './processors';

/**
 * @desc
 *  Produces [Serenity BDD](http://serenity-bdd.info/)-standard JSON reports
 *  that [Serenity BDD CLI Reporter](https://github.com/serenity-bdd/serenity-cli)
 *  can parse to produce HTML reports and living documentation.
 *
 * @example <caption>Registering the reporter programmatically</caption>
 *  import { ArtifactArchiver, configure } from '@serenity-js/core';
 *  import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
 *
 *  configure({
 *    crew: [
 *      ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *      new SerenityBDDReporter()
 *    ],
 *  });
 *
 * @example <caption>Registering the reporter using Protractor configuration</caption>
 *  // protractor.conf.js
 *  const
 *    { ArtifactArchiver }    = require('@serenity-js/core'),
 *    { SerenityBDDReporter } = require('@serenity-js/serenity-bdd');
 *
 *  exports.config = {
 *    framework:     'custom',
 *    frameworkPath: require.resolve('@serenity-js/protractor/adapter'),
 *
 *    serenity: {
 *      crew: [
 *        ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *        new SerenityBDDReporter(),
 *      ],
 *      // other Serenity/JS config
 *    },
 *
 *    // other Protractor config
 *  };
 *
 * @public
 * @implements {@serenity-js/core/lib/stage~StageCrewMember}
 */
export class SerenityBDDReporter implements StageCrewMember {
    private readonly eventQueues = new EventQueues();
    private readonly processors = new EventQueueProcessors();

    /**
     * A queue for domain events that took place before the SceneStarts event,
     * for example in Mocha's `before` hook.
     */
    private readonly eventQueue: DomainEvent[] = [];

    /**
     * @param {@serenity-js/core/lib/stage~Stage} [stage=null] stage
     */
    constructor(private readonly stage: Stage = null) {
    }

    /**
     * @desc
     *  Creates a new instance of this {@link @serenity-js/core/lib/stage~StageCrewMember}
     *  and assigns it to a given {@link @serenity-js/core/lib/stage~Stage}.
     *
     * @see {@link @serenity-js/core/lib/stage~StageCrewMember}
     *
     * @param {@serenity-js/core/lib/stage~Stage} stage
     *  An instance of a {@link @serenity-js/core/lib/stage~Stage} this {@link @serenity-js/core/lib/stage~StageCrewMember} will be assigned to
     *
     * @returns {@serenity-js/core/lib/stage~StageCrewMember}
     *  A new instance of this {@link @serenity-js/core/lib/stage~StageCrewMember}
     */
    assignedTo(stage: Stage): StageCrewMember {
        return new SerenityBDDReporter(stage);
    }

    /**
     * @desc
     *  Handles {@link @serenity-js/core/lib/events~DomainEvent} objects emitted by the {@link @serenity-js/core/lib/stage~StageCrewMember}.
     *
     * @see {@link @serenity-js/core/lib/stage~StageCrewMember}
     *
     * @param {@serenity-js/core/lib/events~DomainEvent} event
     * @returns {void}
     */
    notifyOf (event: DomainEvent): void {

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
        return event.hasOwnProperty('sceneId');
    }
}
