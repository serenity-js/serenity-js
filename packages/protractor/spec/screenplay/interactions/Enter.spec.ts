import { Ensure, equals } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { by, protractor } from 'protractor';

import { BrowseTheWeb, Enter, Navigate, Target, Value } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

describe('Enter', () => {

    const Bernie = Actor.named('Bernie').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

    const Form = {
        Field: Target.the('name field').located(by.id('name')),
        Result: Target.the('result').located(by.id('your-name')),
    };

    /** @test {Enter} */
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
});
