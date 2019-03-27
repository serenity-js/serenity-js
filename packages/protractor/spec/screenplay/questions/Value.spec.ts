import { stage } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { by } from 'protractor';

import { Navigate, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Value', () => {

    const Bernie = stage(new UIActors()).actor('Bernie');

    describe('of', () => {

        /** @test {Text} */
        /** @test {Text.of} */
        it(`allows the actor to read the 'value' attribute of a DOM element matching the locator`, () => Bernie.attemptsTo(
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

        /** @test {Text} */
        /** @test {Text#of} */
        it(`allows the actor to read the 'value' attribute of a DOM element matching the locator`, () => Bernie.attemptsTo(
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

        /** @test {CSSClasses} */
        /** @test {CSSClasses#of} */
        it('allows for a question relative to another target to be asked', () => Bernie.attemptsTo(
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
