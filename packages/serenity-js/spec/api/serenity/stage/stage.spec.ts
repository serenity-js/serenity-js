import { Serenity } from '../../../../src/serenity';
import { Actor } from '../../../../src/serenity/screenplay';
import { Cast, Stage, StageManager } from '../../../../src/serenity/stage';

import sinon = require('sinon');

import expect = require('../../../expect');

describe ('The Stage', () => {

    class MyActors implements Cast {
        actor = (name: string): Actor => Actor.named(name);
    }

    describe ('when used in an acceptance test', () => {
        it ('can be instantiated from Serenity', () => {
            const
                stage = new Serenity().callToStageFor(new MyActors()),

                james = stage.theActorCalled('James');

            expect(james.toString()).to.equal('James');

            expect(stage.theActorInTheSpotlight()).to.equal(james);
        });

        it ('can tell if there is no Actor in the spotlight yet', () => {
            const
                stageManager: StageManager = sinon.createStubInstance(StageManager) as any,

                stage = new Stage(stageManager);

            stage.enter(new MyActors());

            expect(stage.theShowHasStarted()).to.be.false;
        });

        it ('can tell if there is an Actor in the spotlight already', () => {
            const
                stageManager: StageManager = sinon.createStubInstance(StageManager) as any,

                stage = new Stage(stageManager);

            stage.enter(new MyActors());

            stage.theActorCalled('James');

            expect(stage.theShowHasStarted()).to.be.true;
        });
    });

    describe ('when used incorrectly', () => {

        it ('complains if you try to call an Actor, but have not yet provided the Cast yet', () => {
            const
                stageManager: StageManager = sinon.createStubInstance(StageManager) as any,

                stage = new Stage(stageManager);

            expect(() => stage.theActorCalled('James')).to.throw('The cast has not entered the stage yet.');
        });

        it ('complains if you try to get the Actor in the spotlight, but have not shined the spotlight on anyone yet', () => {
            const
                stageManager: StageManager = sinon.createStubInstance(StageManager) as any,

                stage = new Stage(stageManager);

            stage.enter(new MyActors());

            expect(() => stage.theActorInTheSpotlight()).to.throw('There\'s no actor in the spotlight yet.');
        });
    });
});
