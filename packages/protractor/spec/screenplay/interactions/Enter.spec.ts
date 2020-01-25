import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { by } from 'protractor';

import { Enter, Navigate, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

describe('Enter', () => {

    const Form = {
        Field: Target.the('name field').located(by.id('name')),
        Result: Target.the('result').located(by.id('your-name')),
    };

    /** @test {Enter} */
    /** @test {Enter.theValue} */
    it('allows the actor to enter the value into a field', () => actorCalled('Bernie').attemptsTo(
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

        Enter.theValue(actorCalled('Bernie').name).into(Form.Field),

        Ensure.that(Value.of(Form.Field), equals(actorCalled('Bernie').name)),
    ));

    /** @test {Enter#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(Enter.theValue(actorCalled('Bernie').name).into(Form.Field).toString())
            .to.equal(`#actor enters 'Bernie' into the name field`);
    });
});
