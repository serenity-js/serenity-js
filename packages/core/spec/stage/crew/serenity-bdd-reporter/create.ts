import * as sinon from 'sinon';
import { Actor } from '../../../../src';
import { DressingRoom, SerenityBDDReporter, Stage, StageManager } from '../../../../src/stage';

export function create() {
    class Extras implements DressingRoom {
        prepare(actor: Actor): Actor {
            return actor;
        }
    }

    const
        stageManager    = sinon.createStubInstance(StageManager),
        stage           = new Stage(new Extras(), stageManager as unknown as StageManager),
        reporter        = new SerenityBDDReporter(stage);

    return {
        stage,
        stageManager,
        reporter,
    };
}
