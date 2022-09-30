import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { By, Navigate, PageElement, RightClick, Text } from '@serenity-js/web';

describe('RightClick', () => {

    const Form = {
        inputField: PageElement.located(By.id('field')).describedAs('the input field'),
        result:     PageElement.located(By.id('result')).describedAs('a result'),
    };

    it('allows the actor to click on an element', () => actorCalled('Bernie').attemptsTo(
        Navigate.to('/screenplay/interactions/right-click/example.html'),

        Ensure.that(Text.of(Form.result), equals('No result yet')),
        RightClick.on(Form.inputField),
        Ensure.that(Text.of(Form.result), equals('Test for right click.')),
    ));

    it('provides a sensible description of the interaction being performed', () => {
        expect(RightClick.on(Form.inputField).toString())
            .to.equal('#actor right-clicks on the input field');
    });

    it('correctly detects its invocation location', () => {
        const activity = RightClick.on(Form.inputField);
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('RightClick.spec.ts');
        expect(location.line).to.equal(29);
        expect(location.column).to.equal(37);
    });
});
