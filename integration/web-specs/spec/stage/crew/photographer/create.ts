import { EventRecorder } from '@integration/testing-tools';
import { Cast, Clock, Duration, ErrorFactory, serenity } from '@serenity-js/core';
import { Stage, StageManager } from '@serenity-js/core/lib/stage';

export function create(timeout: Duration = Duration.ofSeconds(5), cast?: Cast): {
    stage: Stage,
    recorder: EventRecorder
} {
    const clock = new Clock();
    const interactionTimeout = Duration.ofSeconds(2);

    const
        stageManager = new StageManager(timeout, clock),
        stage = new Stage(
            cast || (serenity as any).stage.cast,
            stageManager, new ErrorFactory(),
            clock,
            interactionTimeout
        ),
        recorder = new EventRecorder();

    stage.assign(recorder);

    return { stage, recorder };
}
