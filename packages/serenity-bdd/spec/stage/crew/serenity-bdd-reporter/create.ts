import { EventRecorder } from '@integration/testing-tools';
import type { Actor, Cast} from '@serenity-js/core';
import { Clock, Duration, ErrorFactory, Stage, StageManager } from '@serenity-js/core';

import { SerenityBDDReporter } from '../../../../src';

export function create(): { stage: Stage, reporter: SerenityBDDReporter, recorder: EventRecorder } {
    class Extras implements Cast {
        prepare(actor: Actor): Actor {
            return actor;
        }
    }

    const
        interactionTimeout  = Duration.ofSeconds(2),
        cueTimeout          = Duration.ofSeconds(1),
        clock           = new Clock(),
        stageManager    = new StageManager(cueTimeout, clock),
        stage           = new Stage(new Extras(), stageManager, new ErrorFactory(), clock, interactionTimeout),
        reporter        = new SerenityBDDReporter(stage),
        recorder        = new EventRecorder([], stage);

    stage.assign(reporter, recorder);

    return {
        stage,
        reporter,
        recorder,
    };
}
