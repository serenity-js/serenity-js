import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Wait } from '@serenity-js/core';
import { Attribute, By, DoubleClick, Navigate, PageElement, Text } from '@serenity-js/web';

describe('DoubleClick', () => {

    const interactiveElement = PageElement.located(By.id('double-click-me')).describedAs('the interactive element');

    /** @test {DoubleClick} */
    /** @test {DoubleClick.on} */
    it('allows the actor to clear the value of a field', () =>
        actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/double-click/example.html'),

            Ensure.eventually(Attribute.called('data-event-handled').of(interactiveElement), equals('false')),

            DoubleClick.on(interactiveElement),

            Wait.until(Attribute.called('data-event-handled').of(interactiveElement), equals('true')),

            Ensure.that(Text.of(interactiveElement), equals('done!')),
        ));

    /** @test {DoubleClick#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(DoubleClick.on(interactiveElement).toString())
            .to.equal('#actor double-clicks on the interactive element');
    });

    it('correctly detects its invocation location', () => {
        const activity = DoubleClick.on(interactiveElement);
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('DoubleClick.spec.ts');
        expect(location.line).to.equal(34);
        expect(location.column).to.equal(38);
    });
});
