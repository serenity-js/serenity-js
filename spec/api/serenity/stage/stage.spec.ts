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
            let stage = Serenity.callToStageFor(new MyActors());

            let james = stage.theActorCalled('James');
            expect(james.toString()).to.equal('James');

            expect(stage.theActorInTheSpotlight()).to.equal(james);
        });

        it ('can tell if there is no Actor in the spotlight yet', () => {
            let stageManager: StageManager = <any> sinon.createStubInstance(StageManager);

            let stage = new Stage(stageManager);
            stage.enter(new MyActors());

            expect(stage.theShowHasStarted()).to.be.false;
        });

        it ('can tell if there is an Actor in the spotlight already', () => {
            let stageManager: StageManager = <any> sinon.createStubInstance(StageManager);

            let stage = new Stage(stageManager);
            stage.enter(new MyActors());

            stage.theActorCalled('James');

            expect(stage.theShowHasStarted()).to.be.true;
        });
    });

    describe ('when used incorrectly', () => {

        it ('complains if you try to call an Actor, but have not yet provided the Cast yet', () => {
            let stageManager: StageManager = <any> sinon.createStubInstance(StageManager);

            let stage = new Stage(stageManager);

            expect(() => stage.theActorCalled('James')).to.throw('The cast has not entered the stage yet.');
        });

        it ('complains if you try to get the Actor in the spotlight, but have not shined the spotlight on anyone yet', () => {
            let stageManager: StageManager = <any> sinon.createStubInstance(StageManager);

            let stage = new Stage(stageManager);
            stage.enter(new MyActors());

            expect(() => stage.theActorInTheSpotlight()).to.throw('There\'s no actor in the spotlight yet.');
        });
    });
});
