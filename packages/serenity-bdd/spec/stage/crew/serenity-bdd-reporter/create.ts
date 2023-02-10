import { EventRecorder } from '@integration/testing-tools';
import { Actor, Cast, Clock, Duration, ErrorFactory, Stage, StageManager } from '@serenity-js/core';

import { SerenityBDDReporter } from '../../../../src';

export function create(): { stage: Stage, reporter: SerenityBDDReporter, recorder: EventRecorder } {
    class Extras implements Cast {
        prepare(actor: Actor): Actor {
            return actor;
        }
    }

    const
        cueTimeout      = Duration.ofSeconds(1),
        clock           = new Clock(),
        stageManager    = new StageManager(cueTimeout, clock),
        stage           = new Stage(new Extras(), stageManager, new ErrorFactory()),
        reporter        = new SerenityBDDReporter(stage),
        recorder        = new EventRecorder([], stage);

    stage.assign(reporter, recorder);

    return {
        stage,
        reporter,
        recorder,
    };
}
