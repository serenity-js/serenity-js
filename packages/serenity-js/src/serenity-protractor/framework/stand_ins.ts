import { DomainEvent, SceneStarts } from '@serenity-js/core/lib/domain';
import { Actor } from '@serenity-js/core/lib/screenplay';
import { Stage, StageCrewMember } from '@serenity-js/core/lib/stage';
import { protractor } from 'protractor';

import { BrowseTheWeb } from '../screenplay/abilities/browse_the_web';

/**
 * Provides generic stand-in actors for the purpose of taking screenshots.
 * This is useful when integrating Serenity/JS with a legacy code base that does not (yet) use the Screenplay Pattern,
 * nor invoke `serenity.callToStageFor(customActors)`.
 */
export class StandIns implements StageCrewMember {

    private static Events_of_Interest = [ SceneStarts ];
    private stage: Stage;

    assignTo(stage: Stage) {
        this.stage = stage;
        this.stage.manager.registerInterestIn(StandIns.Events_of_Interest, this);
    }

    notifyOf(event: DomainEvent<any>): void {
        switch (event.constructor.name) { // tslint:disable-line:switch-default - ignore other events
            case SceneStarts.name:
                this.provideStandInActorsIfNeeded();
                this.shineSpotlightOn('a stand-in actor');
        }
    }

    private provideStandInActorsIfNeeded() {
        if (! this.stage.actorsAreReady()) {
            this.stage.enter({
                actor: (name: string) => {
                    return Actor.named(name).whoCan(BrowseTheWeb.using(protractor.browser));
                },
            });
        }
    }

    private shineSpotlightOn(name: string) {
        this.stage.theActorCalled(name);
    }
}
