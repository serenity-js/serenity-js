import 'mocha';
import { Ensure, equals } from '@serenity-js/assertions';
import { by } from 'protractor';
import { Alert, Click, HandleAlert, Navigate, Target, Text, Wait } from '../../src';
import { pageFromTemplate } from '../fixtures';
import { actorCalled } from '@serenity-js/core';

describe('When demonstrating how to work with alert windows, an actor', function () {

    const alertTargets = {
        trigger: Target.the('alert trigger').located(by.id('alert-demo-trigger')),
        textResult: Target.the('text of the alert clicking result').located(by.id('alert-demo-result')),
    };

    const pageWithAlerts = `
<!DOCTYPE html>
    <html>
        <body>
            <p>Test page for <a href="./alertIsPresent.spec.ts">alert is present unit test</a></p>
            <button id="alert-demo-trigger" onclick="myFunction()">Trigger Alert</button>
            <p id="alert-demo-result"></p>
            <script>
                function myFunction() {
                    var resultText;
                    var response = confirm("Press OK or Cancel");
                    if (response) {
                        resultText = "You pressed OK!";
                    } else {
                        resultText = "You pressed Cancel!";
                    }
                    document.getElementById("alert-demo-result").innerHTML = resultText;
                }
            </script>

        </body>
    </html>
`;
    beforeEach(() => actorCalled('Nick').attemptsTo(
        Navigate.to(pageFromTemplate(pageWithAlerts))));


    /** @test {Accept alert} */
    it('can click the OK action of a triggered alert and see the alert accepted', () => actorCalled('Nick').attemptsTo(
        Click.on(alertTargets.trigger),
        Wait.until(Alert.visibility(), equals(true)),
        Ensure.that(Alert.text(), equals('Press OK or Cancel')),
        HandleAlert.accept(),
        Ensure.that(Text.of(alertTargets.textResult), equals('You pressed OK!')),
    ));

    /** @test {Dismiss alert} */
    it('can click the cancel action of a triggered alert and see the alert dismissed', () => actorCalled('Nick').attemptsTo(
        Click.on(alertTargets.trigger),
        Wait.until(Alert.visibility(), equals(true)),
        Ensure.that(Alert.text(), equals('Press OK or Cancel')),
        HandleAlert.dismiss(),
        Ensure.that(Text.of(alertTargets.textResult), equals('You pressed Cancel!')),
    ));

});
