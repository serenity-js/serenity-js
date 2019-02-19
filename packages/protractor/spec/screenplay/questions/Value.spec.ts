import { Ensure, equals } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { by, protractor } from 'protractor';

import { BrowseTheWeb, Navigate, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

describe('Value', () => {

    const Bernie = Actor.named('Bernie').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

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
    });
});
