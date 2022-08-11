import { ListensToDomainEvents } from './ListensToDomainEvents';
import { Stage } from './Stage';

/**
 * You can think of the {@apilink StageCrewMember} as an in-memory microservice that reacts to {@apilink DomainEvent|domain events},
 * published by the {@apilink StageManager}, and originally emitted by {@apilink Actor|actors} performing activities and Serenity/JS
 * test runner adapters notifying the framework about test scenario-specific events like {@apilink SceneStarts} or {@apilink SceneFinishes}.
 *
 * Every {@apilink StageCrewMember} receives a reference to the {@apilink Stage},
 * and therefore {@apilink StageManager} as well, which enables them to emit {@apilink DomainEvent}s back.
 *
 * This interface is useful when you're interested in implementing custom Serenity/JS reporters or supporting services.
 *
 * ## Implementing a custom StageCrewMember
 *
 * ```ts
 * import { Stage, StageCrewMember } from '@serenity-js/core'
 * import * as events from '@serenity-js/core/lib/events'
 * import { ArbitraryTag } from '@serenity-js/core/lib/model'
 *
 * export class TestRunnerTagger implements StageCrewMember {
 *
 *   static using(tagName: string) {
 *     return new TestRunnerTagger(tagName);
 *   }
 *
 *   protected constructor(
 *     private readonly tagName: string,
 *     private stage?: Stage,
 *   ) {
 *   }
 *
 *   assignedTo(stage: Stage): StageCrewMember {
 *     this.stage = stage;
 *     return this;
 *   }
 *
 *   notifyOf(event: events.DomainEvent): void {
 *     if (event instanceof events.TestRunnerDetected) {
 *       this.stage.announce(
 *         new events.SceneTagged(
 *           this.stage.currentSceneId(),
 *           new ArbitraryTag(this.tagName),
 *           this.stage.currentTime()
 *         )
 *       )
 *     }
 *   }
 * }
 * ```
 *
 * ## Using the custom StageCrewMember
 *
 * ```ts
 * import { configure } from '@serenity-js/core'
 *
 * configure({
 *   crew: [
 *     TestRunnerTagger.using(`Node:${ process.version }`),
 *   ]
 * })
 * ```
 *
 * ## Learn more
 * - {@apilink SerenityConfig.crew}
 * - {@apilink configure}
 * - {@apilink StageCrewMemberBuilder}
 * - {@apilink ListensToDomainEvents}
 * - {@apilink DomainEvent}
 *
 * @group Stage
 */
export interface StageCrewMember extends ListensToDomainEvents {

    /**
     * Assigns a {@apilink Stage} to this {@apilink StageCrewMember}
     */
    assignedTo(stage: Stage): StageCrewMember;
}
