import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage } from '@serenity-js/core';
import { Attribute, by, Click, Navigate, Target } from '@serenity-js/web';

import { UIActors } from '../../UIActors';

/** @test {Click} */
describe('Click', () => {

    const Form = {
        Checkbox: Target.the('checkbox').located(by.id('no-spam-please')),
    };

    beforeEach(() => engage(new UIActors()));

    /** @test {Click.on} */
    it('allows the actor to click on an element', () =>
        actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/click/no_spam_form.html'),

            Click.on(Form.Checkbox),

            Ensure.that(Attribute.called('checked').of(Form.Checkbox), equals('true')),
        ));

    /** @test {Click#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(Click.on(Form.Checkbox).toString())
            .to.equal('#actor clicks on the checkbox');
    });
});
