import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, not } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { By, Click, isSelected, Navigate, PageElement } from '@serenity-js/web';

/** @test {Click} */
describe('Click', () => {

    const Form = {
        checkbox: PageElement.located(By.id('no-spam-please')).describedAs('the checkbox'),
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

    it('correctly detects its invocation location', () => {
        const activity = Click.on(Form.checkbox);
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('Click.spec.ts');
        expect(location.line).to.equal(33);
        expect(location.column).to.equal(32);
    });
});
