import {
    Activity,
    ActivityFinished,
    ActivityStarts,
    Outcome,
    Photo,
    PhotoAttempted,
    PhotoReceipt,
    Result,
    Scene,
    SceneFinished,
    SceneStarts,
} from '../../../../src/serenity/domain';
import { ConsoleReporter, Journal, Stage, StageManager } from '../../../../src/serenity/stage';

import sinon = require('sinon');

import expect = require('../../../expect');
import { consoleReporter } from '../../../../src/stage_crew';

describe ('When reporting on what happened during the rehearsal', () => {

    describe ('Console Reporter', () => {

        let startTime = 1467201010000,
            scene     = new Scene('Paying with a default card', 'Checkout', 'features/checkout.feature');

        it ('can be instantiated using a factory method', () => {
            expect(consoleReporter()).to.be.instanceOf(ConsoleReporter);
        });

        it ('can be instantiated using a factory method and a custom message printer', () => {
            expect(consoleReporter(console.error)).to.be.instanceOf(ConsoleReporter);
        });

        it ('prints any events it receives', () => {
            let print = sinon.spy();

            let stage = new Stage(new StageManager(new Journal()));
            let reporter = new ConsoleReporter(print);

            reporter.assignTo(stage);

            stage.manager.notifyOf(sceneStarted(scene, startTime));
            stage.manager.notifyOf(activityStarted('Configures a default payment method', startTime + 1));
            stage.manager.notifyOf(activityFinished('Configures a default payment method', Result.SUCCESS, startTime + 2));
            stage.manager.notifyOf(photoTaken('Configures a default payment method', 'path/to/image.png', startTime + 3));
            stage.manager.notifyOf(sceneFinished(scene, Result.SUCCESS, startTime + 4));

            expect(print).to.have.callCount(5);

            expect(print.getCall(0).args[0]).to.contain(
                'SceneStarts: Paying with a default card ' +
                '(category: Checkout, path: features/checkout.feature, id: Checkout:Paying with a default card)',
            );

            expect(print.getCall(1).args[0]).to.contain(
                'ActivityStarts: Configures a default payment method',
            );

            expect(print.getCall(2).args[0]).to.contain(
                'ActivityFinished: Configures a default payment method (result: SUCCESS)',
            );

            expect(print.getCall(3).args[0]).to.contain(
                'PhotoAttempted: Configures a default payment method',
            );

            expect(print.getCall(4).args[0]).to.contain(
                'SceneFinished: Paying with a default card ' +
                '(category: Checkout, path: features/checkout.feature, id: Checkout:Paying with a default card) (result: SUCCESS)',
            );
        });

        function sceneStarted(s: Scene, timestamp: number) {
            return new SceneStarts(s, timestamp);
        }

        function activityStarted(name: string, timestamp: number) {
            return new ActivityStarts(new Activity(name), timestamp);
        }

        function activityFinished(name: string, r: Result, ts: number, e?: Error) {
            return new ActivityFinished(new Outcome(new Activity(name), r, e), ts);
        }

        function sceneFinished(s: Scene, r: Result, timestamp: number, e?: Error) {
            return new SceneFinished(new Outcome(s, r, e), timestamp);
        }

        function photoTaken(name: string, path: string, timestamp: number) {
            return new PhotoAttempted(new PhotoReceipt(new Activity(name), Promise.resolve(new Photo(path))), timestamp);
        }
    });
});
