import { EventRecorder } from '@integration/testing-tools';
import { Actor, Cast, Duration } from '@serenity-js/core';
import { Clock, Stage, StageManager } from '@serenity-js/core/lib/stage';
import { protractor } from 'protractor';
import { BrowseTheWeb } from '../../../../src/screenplay/abilities';

class UIActors implements Cast {
    prepare(actor: Actor): Actor {
        switch (actor.name) {
            case 'Adam':
                return actor;

            case 'Betty':
            default:
                return actor.whoCan(BrowseTheWeb.using(protractor.browser));
        }
    }
}

export function create(timeout: Duration = Duration.ofSeconds(1)): { stage: Stage, recorder: EventRecorder } {
    const clock = new Clock();

    const
        stageManager    = new StageManager(timeout, clock),
        stage           = new Stage(new UIActors(), stageManager),
        recorder        = new EventRecorder();

    stage.assign(recorder);

    return { stage, recorder };
}
