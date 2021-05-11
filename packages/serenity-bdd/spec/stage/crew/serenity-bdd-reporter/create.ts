import { Actor, Cast, Stage, StageManager } from '@serenity-js/core';
import * as sinon from 'sinon';

import { SerenityBDDReporter } from '../../../../src';

export function create(): { stageManager: sinon.SinonStubbedInstance<StageManager>, reporter: SerenityBDDReporter } {
    class Extras implements Cast {
        prepare(actor: Actor): Actor {
            return actor;
        }
    }

    const
        stageManager    = sinon.createStubInstance(StageManager),
        stage           = new Stage(new Extras(), stageManager as unknown as StageManager),
        reporter        = new SerenityBDDReporter(stage);

    return {
        stageManager,
        reporter,
    };
}
