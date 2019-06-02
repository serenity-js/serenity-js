import { expect, stage } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { AssertionError } from '@serenity-js/core';
import { by } from 'protractor';

import { isEnabled, Navigate, Target, Wait } from '../../src';
import { pageFromTemplate } from '../fixtures';
import { UIActors } from '../UIActors';

describe('isEnabled', function () {

    const Bernie = stage(new UIActors()).actor('Bernie');

    const Page = {
        Enabled_Button:     Target.the('enabled button').located(by.id('enabled')),
        Disabled_Button:    Target.the('disabled button').located(by.id('disabled')),
    };

    beforeEach(() => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html>
                <body>
                    <button id="enabled">enabled</button>
                    <button disabled id="disabled">disabled</button>
                </body>
            </html>
        `)),
    ));

    /** @test {isEnabled} */
    it('allows the actor flow to continue when the element is enabled', () => expect(Bernie.attemptsTo(
        Wait.until(Page.Enabled_Button, isEnabled()),
        Ensure.that(Page.Enabled_Button, isEnabled()),
    )).to.be.fulfilled);

    /** @test {isEnabled} */
    it('breaks the actor flow when element is disabled', () => {
        return expect(Bernie.attemptsTo(
            Ensure.that(Page.Disabled_Button, isEnabled()),
        )).to.be.rejectedWith(AssertionError, `Expected the disabled button to become enabled`);
    });

    /** @test {isEnabled} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Page.Enabled_Button, isEnabled()).toString())
            .to.equal(`#actor ensures that the enabled button does become enabled`);
    });

    /** @test {isEnabled} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Page.Enabled_Button, isEnabled()).toString())
            .to.equal(`#actor waits up to 5s until the enabled button does become enabled`);
    });
});
