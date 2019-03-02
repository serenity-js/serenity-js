import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { Actor, LogicError, Question } from '@serenity-js/core';
import { ActivityFinished, ActivityStarts, ArtifactGenerated } from '@serenity-js/core/lib/events';
import { Name, TextData } from '@serenity-js/core/lib/model';
import { Clock, StageManager } from '@serenity-js/core/lib/stage';

import { by, protractor } from 'protractor';
import * as sinon from 'sinon';
import { BrowseTheWeb, ExecuteScript, Navigate, Target, Text, Value } from '../../../../src';
import { pageFromTemplate } from '../../../fixtures';

/** @test {ExecuteSynchronousScript} */
describe('ExecuteSynchronousScript', function() {
    this.timeout(30000);

    const Joe = Actor.named('Joe').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

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

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    it('allows the actor to execute a synchronous script', () => Joe.attemptsTo(
        Navigate.to(page),

        ExecuteScript.sync(`
            document.getElementById('name').value = 'Joe';
        `),

        Ensure.that(Value.of(Sandbox.Input), equals(Joe.name)),
    ));

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    it('allows the actor to execute a synchronous script with a static argument', () => Joe.attemptsTo(
        Navigate.to(page),

        ExecuteScript.sync(`
            var name = arguments[0];

            document.getElementById('name').value = name;
        `).withArguments(Joe.name),

        Ensure.that(Value.of(Sandbox.Input), equals(Joe.name)),
    ));

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    it('allows the actor to execute a synchronous script with a promised argument', () => Joe.attemptsTo(
        Navigate.to(page),

        ExecuteScript.sync(`
            var name = arguments[0];

            document.getElementById('name').value = name;
        `).withArguments(Promise.resolve(Joe.name)),

        Ensure.that(Value.of(Sandbox.Input), equals(Joe.name)),
    ));

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    it('allows the actor to execute a synchronous script with a Target argument', () => Joe.attemptsTo(
        Navigate.to(page),

        ExecuteScript.sync(`
            var name = arguments[0];
            var field = arguments[1];

            field.value = name;
        `).withArguments(Joe.name, Sandbox.Input),

        Ensure.that(Value.of(Sandbox.Input), equals(Joe.name)),
    ));

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    /** @test {ExecuteSynchronousScript#toString} */
    it(`provides a sensible description of the interaction being performed when invoked without arguments`, () => {
        expect(ExecuteScript.sync(`
            console.log('hello world');
        `).toString()).to.equal(`#actor executes a synchronous script`);
    });

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    /** @test {ExecuteSynchronousScript#toString} */
    it(`provides a sensible description of the interaction being performed when invoked with arguments`, () => {
        const arg3 = Question.about('arg number 3', actor => void 0);

        expect(ExecuteScript.sync(`console.log('hello world');`)
            .withArguments(Promise.resolve('arg1'), 'arg2', arg3).toString(),
        ).to.equal(`#actor executes a synchronous script with arguments: [ a promised value, 'arg2', arg number 3 ]`);
    });

    /** @test {ExecuteScript.sync} */
    /** @test {ExecuteSynchronousScript} */
    it('emits the events so that the details of the script being executed can be reported', () => {
        const
            frozenClock = new Clock(() => new Date('1970-01-01')),

            stageManager = sinon.createStubInstance(StageManager),
            actor = new Actor('Ashwin', stageManager as any, frozenClock)
                .whoCan(BrowseTheWeb.using(protractor.browser));

        return actor.attemptsTo(
            ExecuteScript.sync(`console.log('hello world');`),
        ).then(() => {
            const events = stageManager.notifyOf.getCalls().map(call => call.lastArg);

            expect(events).to.have.lengthOf(3);
            expect(events[ 0 ]).to.be.instanceOf(ActivityStarts);
            expect(events[ 1 ]).to.be.instanceOf(ArtifactGenerated);
            expect(events[ 2 ]).to.be.instanceOf(ActivityFinished);

            expect((events[ 1 ] as ArtifactGenerated).equals(
                new ArtifactGenerated(
                    new Name(`Script source`),
                    TextData.fromJSON({
                        contentType: 'text/javascript;charset=UTF-8',
                        data: 'console.log(\'hello world\');',
                    }),
                    frozenClock.now(),
                ),
            )).to.equal(true, JSON.stringify(events[ 1 ].toJSON()));
        });
    });
});
