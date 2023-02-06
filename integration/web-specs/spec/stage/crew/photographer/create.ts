import { EventRecorder } from '@integration/testing-tools';
import { Duration, ErrorFactory, serenity } from '@serenity-js/core';
import { Clock, Stage, StageManager } from '@serenity-js/core/lib/stage';

export function create(timeout: Duration = Duration.ofSeconds(5)): { stage: Stage, recorder: EventRecorder } {
    const clock = new Clock();

    const
        stageManager    = new StageManager(timeout, clock),
        stage           = new Stage((serenity as any).stage.cast, stageManager, new ErrorFactory()),
        recorder        = new EventRecorder();

    stage.assign(recorder);

    return { stage, recorder };
}
