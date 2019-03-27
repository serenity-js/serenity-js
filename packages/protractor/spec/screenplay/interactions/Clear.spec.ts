import { expect, stage } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';

import { by } from 'protractor';
import { Clear, Navigate, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Clear', () => {

    const Bernie = stage(new UIActors()).actor('Bernie');

    const Form = {
        Field: Target.the('name field').located(by.id('name')),
    };

    /** @test {Clear} */
    /** @test {Clear.theValueOf} */
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

    /** @test {Clear#toString} */
    it(`provides a sensible description of the interaction being performed`, () => {
        expect(Clear.theValueOf(Form.Field).toString())
            .to.equal('#actor clears the value of the name field');
    });
});
