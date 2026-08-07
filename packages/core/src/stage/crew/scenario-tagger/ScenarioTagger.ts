import type { DomainEvent } from '../../../events/index.js';
import { SceneStarts, SceneTagged } from '../../../events/index.js';
import { ArbitraryTag } from '../../../model/index.js';
import type { Stage } from '../../Stage.js';
import type { StageCrewMember } from '../../StageCrewMember.js';

/**
 * A {@link StageCrewMember} that tags every scenario with the configured tags.
 *
 * Useful in monorepo setups where multiple modules produce reports
 * and you want to identify which module a scenario belongs to.
 *
 * ## Usage
 *
 * ```ts
 * import { configure, ScenarioTagger } from '@serenity-js/core';
 *
 * configure({
 *   crew: [
 *     new ScenarioTagger(['@mocha', '@integration']),
 *   ],
 * });
 * ```
 *
 * @group Stage
 */
export class ScenarioTagger implements StageCrewMember {

    private readonly tags: ArbitraryTag[];
    private stage: Stage;

    constructor(tags: string[]) {
        this.tags = tags.map(t => new ArbitraryTag(t.replace(/^@/, '')));
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof SceneStarts) {
            for (const tag of this.tags) {
                this.stage.announce(new SceneTagged(
                    event.sceneId,
                    tag,
                    this.stage.currentTime(),
                ));
            }
        }
    }
}
