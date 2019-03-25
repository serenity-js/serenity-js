import * as sinon from 'sinon';
import { Actor } from '../../../../src';
import { Cast, SerenityBDDReporter, Stage, StageManager } from '../../../../src/stage';

export function create() {
    const dummies: Cast = {
        actor: (name: string): Actor => null,
    };

    const
        stageManager    = sinon.createStubInstance(StageManager),
        stage           = new Stage(dummies, stageManager as unknown as StageManager),
        reporter        = new SerenityBDDReporter(stage);

    return {
        stage,
        stageManager,
        reporter,
    };
}
