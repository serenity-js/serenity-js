import 'mocha';

import { EventRecorder, expect } from '@integration/testing-tools';
import { Ensure, equals, includes } from '@serenity-js/assertions';
import { actorCalled, Clock, Question, Serenity, serenity } from '@serenity-js/core';
import {
    ActivityFinished,
    ActivityRelatedArtifactGenerated,
    ActivityStarts,
    ActorEntersStage,
    ArtifactGenerated,
    SceneFinishes,
    SceneStarts
} from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, TextData } from '@serenity-js/core/lib/model';
import {
    By,
    ExecuteScript,
    LastScriptExecution,
    Navigate,
    PageElement,
    PageElements,
    Switch,
    Value
} from '@serenity-js/web';

import { defaultCardScenario, sceneId } from '../../../stage/crew/photographer/fixtures';

describe('ExecuteSynchronousScript', function () {

    class Sandbox {
        static Input = PageElement.located(By.id('name')).describedAs('input field');
    }

    describe('detecting invocation location', () => {
        it('correctly detects its invocation location', () => {
            const activity = ExecuteScript.sync('return navigator.userAgent');
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('ExecuteSynchronousScript.spec.ts');
            expect(location.line).to.equal(37);
            expect(location.column).to.equal(44);
        });

        it('correctly detects its invocation location when arguments are used', () => {
            const activity = ExecuteScript.sync(`
                var name = arguments[0];
                var field = arguments[1];

                field.value = name;
            `).withArguments(actorCalled('Joe').name, Sandbox.Input);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('ExecuteSynchronousScript.spec.ts');
            expect(location.line).to.equal(51);
            expect(location.column).to.equal(16);
        });
    });

    it('allows the actor to execute a synchronous script', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.sync(`
                document.getElementById('name').value = 'Joe';
            `),

            Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
        ));

    it('allows the actor to execute a synchronous script inside an iframe', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/page_with_an_iframe.html'),

            ExecuteScript.sync(`return window.exampleMessage;`),
            Ensure.that(LastScriptExecution.result<string>(), equals('Hello from: Page with an iframe!')),

            Switch.to(PageElement.located(By.css('iframe[name="example-iframe"]'))).and(
                ExecuteScript.sync(`return window.exampleMessage;`),
                Ensure.that(LastScriptExecution.result<string>(), equals('Hello from: An iframe!')),
            ),

            ExecuteScript.sync(`return window.exampleMessage;`),
            Ensure.that(LastScriptExecution.result<string>(), equals('Hello from: Page with an iframe!')),
        ));

    it('allows the actor to retrieve the value returned by the script', () =>
        actorCalled('Joe')
            .attemptsTo(
                ExecuteScript.sync('return navigator.userAgent'),
                Ensure.that(LastScriptExecution.result<string>(), includes('Chrome')),
            ));

    it('allows the actor to execute a synchronous script with a static argument', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.sync(`
                var name = arguments[0];

                document.getElementById('name').value = name;
            `).withArguments(actorCalled('Joe').name),

            Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
        ));

    it('allows the actor to execute a synchronous script with a promised argument', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.sync(`
                var name = arguments[0];

                document.getElementById('name').value = name;
            `).withArguments(Promise.resolve(actorCalled('Joe').name)),

            Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
        ));

    describe('when working with page elements', () => {
        it('allows the actor to execute a synchronous script with a PageElement argument', () =>
            actorCalled('Joe').attemptsTo(
                Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

                ExecuteScript.sync(`
                    var name = arguments[0];
                    var field = arguments[1];
    
                    field.value = name;
                `).withArguments(actorCalled('Joe').name, Sandbox.Input),

                Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
            ));

        it('allows the actor to execute a synchronous script with a record of PageElement objects', () =>
            actorCalled('Joe').attemptsTo(
                Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

                ExecuteScript.sync(`
                    var name = arguments[0];
                    var field = arguments[1].include[0];
    
                    field.value = name;
                `).withArguments(actorCalled('Joe').name, Question.fromObject({ include: [ Sandbox.Input ] })),

                Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
            ));

        it('allows the actor to execute a synchronous script with an array of PageElement objects', () =>
            actorCalled('Joe').attemptsTo(
                Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

                ExecuteScript.sync(`
                    var name = arguments[0];
                    var field = arguments[1][0];
    
                    field.value = name;
                `).withArguments(actorCalled('Joe').name, Question.fromArray([ Sandbox.Input ])),

                Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
            ));

        it('allows the actor to execute a synchronous script with a PageElements argument', () =>
            actorCalled('Joe').attemptsTo(
                Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

                ExecuteScript.sync(`
                    var name = arguments[0];
                    var field = arguments[1][0];
    
                    field.value = name;
                `).withArguments(actorCalled('Joe').name, PageElements.located(By.css('input')) ),

                Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
            ));

        it('allows the actor to execute a synchronous script with a PageElement determined by PEQL', () =>
            actorCalled('Joe').attemptsTo(
                Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

                ExecuteScript.sync(`
                    var name = arguments[0];
                    var field = arguments[1];
    
                    field.value = name;
                `).withArguments(actorCalled('Joe').name, PageElements.located(By.css('input')).first() ),

                Ensure.that(Value.of(Sandbox.Input), equals(actorCalled('Joe').name)),
            ));
    });

    it('provides a sensible description of the interaction being performed when invoked without arguments', () => {
        expect(ExecuteScript.sync(`
            console.log('hello world');
        `).toString()).to.equal(`#actor executes a synchronous script`);
    });

    it('provides a sensible description of the interaction being performed when invoked with arguments', () => {
        const arg3 = Question.about('arg number 3', actor => void 0);

        expect(ExecuteScript.sync(`console.log('hello world');`)
            .withArguments(Promise.resolve('arg1'), 'arg2', arg3).toString(),
        ).to.equal(`#actor executes a synchronous script with arguments: [ Promise, "arg2", arg number 3 ]`);
    });

    it('complains if the script has failed', () =>
        expect(actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/input_field.html'),

            ExecuteScript.sync(`
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

        localSerenity.announce(new SceneStarts(sceneId, defaultCardScenario));

        await localSerenity.theActorCalled('Ashwin').attemptsTo(
            ExecuteScript.sync(`console.log('hello world');`),
        );

        localSerenity.announce(new SceneFinishes(sceneId, new ExecutionSuccessful()));
        await localSerenity.waitForNextCue();

        const events = recorder.events;

        expect(events.length).to.be.greaterThan(5);
        expect(events[1]).to.be.instanceOf(ActorEntersStage);
        expect(events[2]).to.be.instanceOf(ActivityStarts);
        expect(events[3]).to.be.instanceOf(ArtifactGenerated);
        expect(events[4]).to.be.instanceOf(ActivityFinished);

        const artifactGenerated = events[3] as ActivityRelatedArtifactGenerated;

        expect(artifactGenerated.name.value).to.equal(`Script source`);

        expect(artifactGenerated.artifact.equals(TextData.fromJSON({
            contentType: 'text/javascript;charset=UTF-8',
            data: 'console.log(\'hello world\');',
        }))).to.equal(true, JSON.stringify(artifactGenerated.artifact.toJSON()));

        expect(artifactGenerated.timestamp.equals(frozenClock.now())).to.equal(true, artifactGenerated.timestamp.toString());
    });
});
