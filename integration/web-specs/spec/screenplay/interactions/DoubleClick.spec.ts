import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { By, DoubleClick, Navigate, PageElement, Text } from '@serenity-js/web';

describe('DoubleClick', () => {

    const interactiveElement = PageElement.located(By.id('double-click-me')).describedAs('the interactive element');

    /** @test {DoubleClick} */
    /** @test {DoubleClick.on} */
    it('allows the actor to clear the value of a field', () =>
        actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/double-click/example.html'),

            DoubleClick.on(interactiveElement),

            Ensure.that(Text.of(interactiveElement), equals('done!')),
        ));

    /** @test {DoubleClick#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(DoubleClick.on(interactiveElement).toString())
            .to.equal('#actor double-clicks on the interactive element');
    });
});
