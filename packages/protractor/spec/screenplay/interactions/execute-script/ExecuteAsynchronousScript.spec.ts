import { expect, stage } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { Question } from '@serenity-js/core';
import { ActivityFinished, ActivityStarts, ArtifactGenerated } from '@serenity-js/core/lib/events';
import { Name, TextData } from '@serenity-js/core/lib/model';
import { Clock } from '@serenity-js/core/lib/stage';

import { by } from 'protractor';
import * as sinon from 'sinon';
import { ExecuteScript, Navigate, Target, Value } from '../../../../src';
import { pageFromTemplate } from '../../../fixtures';
import { UIActors } from '../../../UIActors';

/** @test {ExecuteAsynchronousScript} */
describe('ExecuteAsynchronousScript', function() {

    const Joe = stage(new UIActors()).actor('Joe');

    const page = pageFromTemplate(`
        <html>
            <body>
                <form>
                    <input type="text" id="name" />
                </form>
            </body>
        </html>
    `);

    class Sandbox {
        static Input = Target.the('input field').located(by.id('name'));
    }

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    it('allows the actor to execute an asynchronous script', () => Joe.attemptsTo(
        Navigate.to(page),

        ExecuteScript.async(`
            var callback = arguments[arguments.length - 1];

            setTimeout(function() {
                document.getElementById('name').value = 'Joe';
                callback();
            }, 100);
        `),

        Ensure.that(Value.of(Sandbox.Input), equals(Joe.name)),
    ));

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    it('allows the actor to execute an asynchronous script with a static argument', () => Joe.attemptsTo(
        Navigate.to(page),

        ExecuteScript.async(`
            var name = arguments[0];
            var callback = arguments[arguments.length - 1];

            setTimeout(function() {
                document.getElementById('name').value = name;
                callback();
            }, 100);
        `).withArguments(Joe.name),

        Ensure.that(Value.of(Sandbox.Input), equals(Joe.name)),
    ));

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    it('allows the actor to execute an asynchronous script with a promised argument', () => Joe.attemptsTo(
        Navigate.to(page),

        ExecuteScript.async(`
            var name = arguments[0];
            var callback = arguments[arguments.length - 1];

            setTimeout(function() {
                document.getElementById('name').value = name;
                callback();
            }, 100);
        `).withArguments(Promise.resolve(Joe.name)),

        Ensure.that(Value.of(Sandbox.Input), equals(Joe.name)),
    ));

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    it('allows the actor to execute an asynchronous script with a Target argument', () => Joe.attemptsTo(
        Navigate.to(page),

        ExecuteScript.async(`
            var name = arguments[0];
            var field = arguments[1];
            var callback = arguments[arguments.length - 1];

            setTimeout(function() {
                field.value = name;
                callback();
            }, 100);
        `).withArguments(Joe.name, Sandbox.Input),

        Ensure.that(Value.of(Sandbox.Input), equals(Joe.name)),
    ));

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    /** @test {ExecuteAsynchronousScript#toString} */
    it(`provides a sensible description of the interaction being performed when invoked without arguments`, () => {
        expect(ExecuteScript.async(`
            arguments[arguments.length - 1]();
        `).toString()).to.equal(`#actor executes an asynchronous script`);
    });

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript#toString} */
    it(`provides a sensible description of the interaction being performed when invoked with arguments`, () => {
        const arg3 = Question.about('arg number 3', actor => void 0);

        expect(ExecuteScript.async(`arguments[arguments.length - 1]();`)
            .withArguments(Promise.resolve('arg1'), 'arg2', arg3).toString(),
        ).to.equal(`#actor executes an asynchronous script with arguments: [ a promised value, 'arg2', arg number 3 ]`);
    });

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    it('complains if the script has failed', () => expect(Joe.attemptsTo(
        Navigate.to(page),

        ExecuteScript.async(`
            var callback = arguments[arguments.length - 1];

            throw new Error("something's not quite right here");
        `),
    )).to.be.rejectedWith(Error, `something's not quite right here`));

    /** @test {ExecuteScript.async} */
    /** @test {ExecuteAsynchronousScript} */
    it('emits the events so that the details of the script being executed can be reported', () => {
        const
            frozenClock = new Clock(() => new Date('1970-01-01')),

            theStage = stage(new UIActors(), frozenClock),
            actor = theStage.theActorCalled('Ashwin');

        sinon.spy(theStage, 'announce');

        return actor.attemptsTo(
            ExecuteScript.async(`arguments[arguments.length - 1]();`),
        ).then(() => {
            const events = (theStage.announce as sinon.SinonSpy).getCalls().map(call => call.lastArg);

            expect(events).to.have.lengthOf(3);
            expect(events[ 0 ]).to.be.instanceOf(ActivityStarts);
            expect(events[ 1 ]).to.be.instanceOf(ArtifactGenerated);
            expect(events[ 2 ]).to.be.instanceOf(ActivityFinished);

            expect((events[ 1 ] as ArtifactGenerated).equals(
                new ArtifactGenerated(
                    new Name(`Script source`),
                    TextData.fromJSON({
                        contentType: 'text/javascript;charset=UTF-8',
                        data: 'arguments[arguments.length - 1]();',
                    }),
                    frozenClock.now(),
                ),
            )).to.equal(true, JSON.stringify(events[ 1 ].toJSON()));
        });
    });
});
