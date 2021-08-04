import 'mocha';

import { EventRecorder, expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Question, Serenity } from '@serenity-js/core';
import { ActivityFinished, ActivityRelatedArtifactGenerated, ActivityStarts, ArtifactGenerated } from '@serenity-js/core/lib/events';
import { TextData } from '@serenity-js/core/lib/model';
import { Clock } from '@serenity-js/core/lib/stage';

import { by, ExecuteScript, Navigate, Target, Value } from '../../../../src';
import { Actors } from '../../Actors';

/** @test {ExecuteScript} */
describe('ExecuteAsynchronousScript', function () {

    class Sandbox {
        static Input = Target.the('input field').located(by.id('name'));
    }

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    it('allows the actor to execute an asynchronous script', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.async(`
                var callback = arguments[arguments.length - 1];
    
                setTimeout(function () {
                    document.getElementById('name').value = 'Joe';
                    callback();
                }, 100);
            `),

            Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
        ));

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    it('allows the actor to execute an asynchronous script with a static argument', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.async(`
                var name = arguments[0];
                var callback = arguments[arguments.length - 1];
    
                setTimeout(function () {
                    document.getElementById('name').value = name;
                    callback();
                }, 100);
            `).withArguments(actorCalled('Joe').name),

            Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
        ));

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    it('allows the actor to execute an asynchronous script with a promised argument', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.async(`
                var name = arguments[0];
                var callback = arguments[arguments.length - 1];
    
                setTimeout(function () {
                    document.getElementById('name').value = name;
                    callback();
                }, 100);
            `).withArguments(Promise.resolve(actorCalled('Joe').name)),

            Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
        ));

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    it('allows the actor to execute an asynchronous script with a Target argument', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.async(`
                var name = arguments[0];
                var field = arguments[1];
                var callback = arguments[arguments.length - 1];
    
                setTimeout(function () {
                    field.value = name;
                    callback();
                }, 100);
            `).withArguments(actorCalled('Joe').name, Sandbox.Input),

            Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
        ));

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    /** @test {ExecuteAsynchronousScript#toString} */
    it('provides a sensible description of the interaction being performed when invoked without arguments', () => {
        expect(ExecuteScript.async(`
            arguments[arguments.length - 1]();
        `).toString()).to.equal(`#actor executes an asynchronous script`);
    });

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript#toString} */
    it('provides a sensible description of the interaction being performed when invoked with arguments', () => {
        const arg3 = Question.about('arg number 3', actor => void 0);

        expect(ExecuteScript.async(`arguments[arguments.length - 1]();`)
            .withArguments(Promise.resolve('arg1'), 'arg2', arg3).toString(),
        ).to.equal(`#actor executes an asynchronous script with arguments: [ a Promise, 'arg2', arg number 3 ]`);
    });

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    it('complains if the script has failed', () =>
        expect(actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.async(`
                var callback = arguments[arguments.length - 1];
    
                throw new Error("something's not quite right here");
            `),
        )).to.be.rejectedWith(Error, `something's not quite right here`));

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    it('emits the events so that the details of the script being executed can be reported', () => {
        const frozenClock = new Clock(() => new Date('1970-01-01'));
        const serenity = new Serenity(frozenClock);
        const recorder = new EventRecorder();

        serenity.configure({
            actors: new Actors(),
            crew: [ recorder ],
        });

        return serenity.theActorCalled('Ashwin').attemptsTo(
            ExecuteScript.async(`arguments[arguments.length - 1]();`),
        ).then(() => {
            const events = recorder.events;

            expect(events).to.have.lengthOf(3);
            expect(events[ 0 ]).to.be.instanceOf(ActivityStarts);
            expect(events[ 1 ]).to.be.instanceOf(ArtifactGenerated);
            expect(events[ 2 ]).to.be.instanceOf(ActivityFinished);

            const artifactGenerated = events[ 1 ] as ActivityRelatedArtifactGenerated;

            expect(artifactGenerated.name.value).to.equal(`Script source`);

            expect(artifactGenerated.artifact.equals(TextData.fromJSON({
                contentType: 'text/javascript;charset=UTF-8',
                data: 'arguments[arguments.length - 1]();',
            }))).to.equal(true, JSON.stringify(artifactGenerated.artifact.toJSON()));

            expect(artifactGenerated.timestamp.equals(frozenClock.now())).to.equal(true, artifactGenerated.timestamp.toString());
        });
    });
});
