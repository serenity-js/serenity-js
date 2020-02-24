import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { by } from 'protractor';

import { isClickable, Navigate, Target, Wait } from '../../src';
import { pageFromTemplate } from '../fixtures';

describe('isClickable', function () {

    const Page = {
        Enabled_Button:     Target.the('enabled button').located(by.id('enabled')),
        Disabled_Button:    Target.the('disabled button').located(by.id('disabled')),
        Hidden_Button:      Target.the('hidden button').located(by.id('hidden')),
    };

    beforeEach(() => actorCalled('Bernie').attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html>
                <body>
                    <button id="enabled">enabled</button>
                    <button disabled id="disabled">disabled</button>
                    <button style="display:none;" id="hidden">hidden</button>
                </body>
            </html>
        `)),
    ));

    /** @test {isClickable} */
    it('allows the actor flow to continue when the element is clickable', () => expect(actorCalled('Bernie').attemptsTo(
        Wait.until(Page.Enabled_Button, isClickable()),
        Ensure.that(Page.Enabled_Button, isClickable()),
    )).to.be.fulfilled);

    /** @test {isClickable} */
    it('breaks the actor flow when element is disabled', () => {
        return expect(actorCalled('Bernie').attemptsTo(
            Ensure.that(Page.Disabled_Button, isClickable()),
        )).to.be.rejectedWith(AssertionError, `Expected the disabled button to become enabled`);
    });

    /** @test {isClickable} */
    it('breaks the actor flow when element is not visible', () => {
        return expect(actorCalled('Bernie').attemptsTo(
            Ensure.that(Page.Hidden_Button, isClickable()),
        )).to.be.rejectedWith(AssertionError, `Expected the hidden button to become displayed`);
    });

    /** @test {isClickable} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Page.Enabled_Button, isClickable()).toString())
            .to.equal(`#actor ensures that the enabled button does become clickable`);
    });

    /** @test {isClickable} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Page.Enabled_Button, isClickable()).toString())
            .to.equal(`#actor waits up to 5s until the enabled button does become clickable`);
    });
});
