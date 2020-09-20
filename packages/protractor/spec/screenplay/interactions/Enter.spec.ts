import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { by } from 'protractor';

import { Enter, Navigate, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

/** @test {Enter} */
describe('Enter', () => {

    const Form = {
        Field: Target.the('name field').located(by.id('field')),
        Result: Target.the('result').located(by.id('result')),
    };

    const page = pageFromTemplate(`
            <html>
                <body>
                    <form>
                        <input type="text" id="field" onkeyup="update()" />
                        <div id="result" />
                    </form>
                    <script>
                    function update() {
                      document.getElementById("result").textContent = document.getElementById("field).value;
                    }
                    </script>
                </body>
            </html>
        `)

    /** @test {Enter} */
    /** @test {Enter.theValue} */
    it('allows the actor to enter the value into an input field', () => actorCalled('Bernie').attemptsTo(
        Navigate.to(page),

        Enter.theValue(actorCalled('Bernie').name).into(Form.Field),

        Ensure.that(Value.of(Form.Field), equals(actorCalled('Bernie').name)),
    ));

    /** @test {Enter} */
    /** @test {Enter.theValue} */
    it('allows the actor to enter the value into a number field', () => actorCalled('Bernie').attemptsTo(
        Navigate.to(page),

        Enter.theValue(123).into(Form.Field),

        Ensure.that(Value.of(Form.Field), equals('123')),
    ));

    /** @test {Enter#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(Enter.theValue(actorCalled('Bernie').name).into(Form.Field).toString())
            .to.equal(`#actor enters 'Bernie' into the name field`);
    });
});
