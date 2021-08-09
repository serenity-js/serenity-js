import 'mocha';

import { EventRecorder, expect } from '@integration/testing-tools';
import { containAtLeastOneItemThat, Ensure, equals, includes, property } from '@serenity-js/assertions';
import { actorCalled, engage, Question, Serenity } from '@serenity-js/core';
import { ActivityFinished, ActivityRelatedArtifactGenerated, ActivityStarts, ArtifactGenerated } from '@serenity-js/core/lib/events';
import { TextData } from '@serenity-js/core/lib/model';
import { Clock } from '@serenity-js/core/lib/stage';
import { by, error } from 'protractor';

import { Browser, ExecuteScript, LastScriptExecution, Navigate, Target, Value } from '../../../../src';
import { UIActors } from '../../../UIActors';

/** @test {ExecuteScript} */
describe('ExecuteSynchronousScript', function () {

    class Sandbox {
        static Input = Target.the('input field').located(by.id('name'));
    }

    beforeEach(() => engage(new UIActors()));

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    it('allows the actor to execute a synchronous script', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.sync(`
                document.getElementById('name').value = 'Joe';
            `),

            Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
        ));

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    /** @test {LastScriptExecution.result} */
    it('allows the actor to retrieve the value returned by the script', () =>
        actorCalled('Joe')
            .attemptsTo(
                ExecuteScript.sync('return navigator.userAgent'),
                Ensure.that(LastScriptExecution.result<string>(), includes('Chrome')),
            ));

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    it('allows the actor to execute a synchronous script with a static argument', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.sync(`
                var name = arguments[0];
    
                document.getElementById('name').value = name;
            `).withArguments(actorCalled('Joe').name),

            Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
        ));

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    it('allows the actor to execute a synchronous script with a promised argument', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.sync(`
                var name = arguments[0];
    
                document.getElementById('name').value = name;
            `).withArguments(Promise.resolve(actorCalled('Joe').name)),

            Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
        ));

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    it('allows the actor to execute a synchronous script with a Target argument', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.sync(`
                var name = arguments[0];
                var field = arguments[1];
    
                field.value = name;
            `).withArguments(actorCalled('Joe').name, Sandbox.Input),

            Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
        ));

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    /** @test {ExecuteSynchronousScript#toString} */
    it('provides a sensible description of the interaction being performed when invoked without arguments', () => {
        expect(ExecuteScript.sync(`
            console.log('hello world');
        `).toString()).to.equal(`#actor executes a synchronous script`);
    });

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    /** @test {ExecuteSynchronousScript#toString} */
    it('provides a sensible description of the interaction being performed when invoked with arguments', () => {
        const arg3 = Question.about('arg number 3', actor => void 0);

        expect(ExecuteScript.sync(`console.log('hello world');`)
            .withArguments(Promise.resolve('arg1'), 'arg2', arg3).toString(),
        ).to.equal(`#actor executes a synchronous script with arguments: [ a Promise, 'arg2', arg number 3 ]`);
    });

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    /** @test {LastScriptExecution} */
    it('complains if the script has failed', () =>
        expect(actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.sync(`
                    throw new Error("something's not quite right here");
                `),
        )).to.be.rejectedWith(error.JavascriptError, `javascript error: something's not quite right here`));

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    it('emits the events so that the details of the script being executed can be reported', () => {
        const frozenClock = new Clock(() => new Date('1970-01-01'));
        const serenity = new Serenity(frozenClock);
        const recorder = new EventRecorder();

        serenity.configure({
            actors: new UIActors(),
            crew: [ recorder ],
        });

        return serenity.theActorCalled('Ashwin').attemptsTo(
            ExecuteScript.sync(`console.log('hello world');`),
            Ensure.that(Browser.log(), containAtLeastOneItemThat(property('message', includes('hello world')))),
        ).then(() => {
            const events = recorder.events;

            expect(events).to.have.lengthOf(5);
            expect(events[ 0 ]).to.be.instanceOf(ActivityStarts);
            expect(events[ 1 ]).to.be.instanceOf(ArtifactGenerated);
            expect(events[ 2 ]).to.be.instanceOf(ActivityFinished);

            const artifactGenerated = events[ 1 ] as ActivityRelatedArtifactGenerated;

            expect(artifactGenerated.name.value).to.equal(`Script source`);

            expect(artifactGenerated.artifact.equals(TextData.fromJSON({
                contentType: 'text/javascript;charset=UTF-8',
                data: 'console.log(\'hello world\');',
            }))).to.equal(true, JSON.stringify(artifactGenerated.artifact.toJSON()));

            expect(artifactGenerated.timestamp.equals(frozenClock.now())).to.equal(true, artifactGenerated.timestamp.toString());
        });
    });
});
