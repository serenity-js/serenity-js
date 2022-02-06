import { Stage, StageCrewMember } from '@serenity-js/core';
import * as events from '@serenity-js/core/lib/events';
import { ArbitraryTag } from '@serenity-js/core/lib/model';

export class TestRunnerTagger implements StageCrewMember {

    constructor(
        private readonly tagName: string,
        private stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new TestRunnerTagger(this.tagName, stage);
    }

    notifyOf(event: events.DomainEvent): void {
        if (event instanceof events.TestRunnerDetected) {
            this.stage.announce(
                new events.SceneTagged(
                    this.stage.currentSceneId(),
                    new ArbitraryTag(`${this.tagName}:${ event.name.value }`),
                    this.stage.currentTime()
                )
            );
        }
    }
}
