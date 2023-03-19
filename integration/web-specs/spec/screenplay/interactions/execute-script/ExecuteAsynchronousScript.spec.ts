import 'mocha';

import { EventRecorder, expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Clock, Question, Serenity,serenity } from '@serenity-js/core';
import { ActivityFinished, ActivityRelatedArtifactGenerated, ActivityStarts, ArtifactGenerated, SceneFinishes, SceneStarts } from '@serenity-js/core/lib/events';
import { TextData } from '@serenity-js/core/lib/model';
import { By, ExecuteScript, Navigate, PageElement, Value } from '@serenity-js/web';

import { defaultCardScenario, sceneId } from '../../../stage/crew/photographer/fixtures';

describe('ExecuteAsynchronousScript', function () {

    class Sandbox {
        static Input = PageElement.located(By.id('name')).describedAs('input field');
    }

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

    it('provides a sensible description of the interaction being performed when invoked without arguments', () => {
        expect(ExecuteScript.async(`
            arguments[arguments.length - 1]();
        `).toString()).to.equal(`#actor executes an asynchronous script`);
    });

    it('provides a sensible description of the interaction being performed when invoked with arguments', () => {
        const arg3 = Question.about('arg number 3', actor => void 0);

        expect(ExecuteScript.async(`arguments[arguments.length - 1]();`)
            .withArguments(Promise.resolve('arg1'), 'arg2', arg3).toString(),
        ).to.equal(`#actor executes an asynchronous script with arguments: [ <<Promise>>, 'arg2', <<arg number 3>> ]`);
    });

    it('complains if the script has failed', () =>
        expect(actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.async(`
                var callback = arguments[arguments.length - 1];
    
                throw new Error("something's not quite right here");
            `),
        )).to.be.rejectedWith(Error, `something's not quite right here`));

    it('emits the events so that the details of the script being executed can be reported', async () => {
        const frozenClock = new Clock(() => new Date('1970-01-01'));
        const actors = (serenity as any).stage.cast;
        const localSerenity = new Serenity(frozenClock);
        const recorder = new EventRecorder();

        localSerenity.configure({
            actors,
            crew: [ recorder ],
        });

        localSerenity.announce(new SceneStarts(sceneId, defaultCardScenario))

        await localSerenity.theActorCalled('Ashwin').attemptsTo(
            ExecuteScript.async(`arguments[arguments.length - 1]();`),
        );

        localSerenity.announce(new SceneFinishes(sceneId));
        await localSerenity.waitForNextCue();

        const events = recorder.events;

        expect(events.length).to.be.greaterThan(4);
        expect(events[0]).to.be.instanceOf(SceneStarts);
        expect(events[1]).to.be.instanceOf(ActivityStarts);
        expect(events[2]).to.be.instanceOf(ArtifactGenerated);
        expect(events[3]).to.be.instanceOf(ActivityFinished);

        const artifactGenerated = events[2] as ActivityRelatedArtifactGenerated;

        expect(artifactGenerated.name.value).to.equal(`Script source`);

        expect(artifactGenerated.artifact.equals(TextData.fromJSON({
            contentType: 'text/javascript;charset=UTF-8',
            data: 'arguments[arguments.length - 1]();',
        }))).to.equal(true, JSON.stringify(artifactGenerated.artifact.toJSON()));

        expect(artifactGenerated.timestamp.equals(frozenClock.now())).to.equal(true, artifactGenerated.timestamp.toString());
    });

    describe('detecting invocation location', () => {
        it('correctly detects its invocation location', () => {
            const activity = ExecuteScript.async(`arguments[arguments.length - 1]();`);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('ExecuteAsynchronousScript.spec.ts');
            expect(location.line).to.equal(153);
            expect(location.column).to.equal(44);
        });

        it('correctly detects its invocation location when arguments are used', () => {
            const activity = ExecuteScript.async(`
                var name = arguments[0];
                var callback = arguments[arguments.length - 1];
    
                setTimeout(function () {
                    document.getElementById('name').value = name;
                    callback();
                }, 100);
            `).withArguments(actorCalled('Joe').name);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('ExecuteAsynchronousScript.spec.ts');
            expect(location.line).to.equal(170);
            expect(location.column).to.equal(16);
        });
    });
});
