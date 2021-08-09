import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, not } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { by, Click, isSelected, Navigate, Target } from '../../../src';

/** @test {Click} */
describe('Click', () => {

    const Form = {
        checkbox: Target.the('checkbox').located(by.id('no-spam-please')),
    };

    /** @test {Click.on} */
    it('allows the actor to click on an element', () =>
        actorCalled('Wendy').attemptsTo(
            Navigate.to('/screenplay/interactions/click/no_spam_form.html'),
            Ensure.that(Form.checkbox, not(isSelected())),

            Click.on(Form.checkbox),

            Ensure.that(Form.checkbox, isSelected()),
        ));

    /** @test {Click#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(Click.on(Form.checkbox).toString())
            .to.equal('#actor clicks on the checkbox');
    });
});
