import { expect, stage } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { by } from 'protractor';

import { Enter, Navigate, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Enter', () => {

    const Bernie = stage(new UIActors()).actor('Bernie');

    const Form = {
        Field: Target.the('name field').located(by.id('name')),
        Result: Target.the('result').located(by.id('your-name')),
    };

    /** @test {Enter} */
    /** @test {Enter.theValue} */
    it('allows the actor to enter the value into a field', () => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html>
                <body>
                    <form>
                        <input type="text" id="name" onkeyup="update()" />
                        <div id="your-name" />
                    </form>
                    <script>
                    function update() {
                      document.getElementById("your-name").textContent = document.getElementById("name").value;
                    }
                    </script>
                </body>
            </html>
        `)),

        Enter.theValue(Bernie.name).into(Form.Field),

        Ensure.that(Value.of(Form.Field), equals(Bernie.name)),
    ));

    /** @test {Enter#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(Enter.theValue(Bernie.name).into(Form.Field).toString())
            .to.equal(`#actor enters 'Bernie' into the name field`);
    });
});
