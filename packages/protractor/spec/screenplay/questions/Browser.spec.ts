import { stage } from '@integration/testing-tools';
import { containAtLeastOneItemThat, Ensure, equals, includes, property } from '@serenity-js/assertions';
import { Log } from '@serenity-js/core';
import { by } from 'protractor';

import { Browser, Click, Navigate, Target } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Browser', () => {

    const Bernie = stage(new UIActors()).actor('Bernie');

    /** @test {Browser.log} */
    it('returns no entries if the console log is empty', () => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html lang="en" />
        `)),

        Ensure.that(Browser.log(), property('length', equals(0))),
    ));

    /** @test {Browser.log} */
    it('allows the actor to read the browser log entries', () => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html lang="en">
                <body>
                    <script>
                        console.log('Hello from the console!');
                    </script>
                </body>
            </html>
        `)),

        Ensure.that(Browser.log(), containAtLeastOneItemThat(property('message', includes('Hello from the console!')))),
    ));

    const Trigger = Target.the('trigger button').located(by.id('trigger'));

    /** @test {Browser.log} */
    it('clears the log upon invocation', () => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html lang="en">
                <body>
                    <button id="trigger" onclick="console.log('new entry')">Print to console</button>
                </body>
            </html>
        `)),

        Click.on(Trigger),
        Ensure.that(Browser.log(), property('length', equals(1))),

        Click.on(Trigger),
        Ensure.that(Browser.log(), property('length', equals(1))),
    ));
});
