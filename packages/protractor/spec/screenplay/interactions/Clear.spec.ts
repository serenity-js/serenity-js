import { endsWith, Ensure, equals } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { by, protractor } from 'protractor';

import { BrowseTheWeb, Clear, Navigate, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

describe('Clear', () => {

    const Bernie = Actor.named('Bernie').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

    const Form = {
        Field: Target.the('name field').located(by.id('name')),
    };

    /** @test {Enter} */
    it('allows the actor to clear the value of a field', () => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html>
                <body>
                    <form>
                        <input type="text" id="name" value="Jan" />
                    </form>
                </body>
            </html>
        `)),

        Clear.theValueOf(Form.Field),

        Ensure.that(Value.of(Form.Field), equals('')),
    ));
});
