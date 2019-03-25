import { EventRecorder } from '@integration/testing-tools';
import { Actor, Duration } from '@serenity-js/core';
import { Clock, Stage, StageManager } from '@serenity-js/core/lib/stage';
import { protractor } from 'protractor';
import { BrowseTheWeb } from '../../../src/screenplay/abilities';

export function create(timeout: Duration = Duration.ofSeconds(1)) {
    const clock = new Clock();

    const
        stageManager    = new StageManager(timeout, clock),
        actors          = { actor: (name: string) => {
            return new Actor(name, stageManager, clock)
                .whoCan(BrowseTheWeb.using(protractor.browser));
        }},
        stage           = new Stage(actors, stageManager),
        recorder        = new EventRecorder();

    stage.assign(recorder);

    return { stage, recorder };
}
