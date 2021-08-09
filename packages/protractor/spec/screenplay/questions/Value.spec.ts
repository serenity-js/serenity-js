import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage } from '@serenity-js/core';
import { by } from 'protractor';

import { Navigate, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Value', () => {

    beforeEach(() => engage(new UIActors()));

    describe('of', () => {

        /** @test {Value} */
        /** @test {Value.of} */
        it('allows the actor to read the "value" attribute of a DOM element matching the locator', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(pageFromTemplate(`
                <html>
                <body>
                    <form>
                        <input name="username" value="jan-molak" />
                    </form>
                </body>
                </html>
            `)),

            Ensure.that(Value.of(Target.the('username field').located(by.tagName('input'))), equals('jan-molak')),
        ));

        /** @test {Value} */
        /** @test {Value#of} */
        it('allows the actor to read the "value" attribute of a DOM element matching the locator', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(pageFromTemplate(`
                <html>
                <body>
                    <form>
                        <input name="username" value="jan-molak" />
                    </form>
                </body>
                </html>
            `)),

            Ensure.that(Value.of(Target.the('username field').located(by.tagName('input'))), equals('jan-molak')),
        ));

        /** @test {Value} */
        /** @test {Value#of} */
        it('allows for a question relative to another target to be asked', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(pageFromTemplate(`
                <html>
                <body>
                    <form>
                        <input name="username" value="jan-molak" />
                    </form>
                </body>
                </html>
            `)),

            Ensure.that(
                Value.of(Target.the('username field').located(by.tagName('input')))
                    .of(Target.the(`form`).located(by.tagName('form'))),
                equals('jan-molak'),
            ),
        ));
    });
});
