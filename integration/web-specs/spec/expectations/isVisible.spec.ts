import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { By, isVisible, Navigate, PageElement, Wait } from '@serenity-js/web';

describe('isVisible', function () {

    const Page = {
        visibleHeader:      PageElement.located(By.css('h1')).describedAs('the header'),
        invisibleHeader:    PageElement.located(By.css('h2')).describedAs('the invisible header'),
        nonExistentHeader:  PageElement.located(By.css('h3')).describedAs('the non-existent header'),
    };

    beforeEach(() =>
        actorCalled('Wendy').attemptsTo(
            Navigate.to('/expectations/is-visible/visibility.html'),
        ));

    /** @test {isVisible} */
    it('allows the actor flow to continue when the element is visible', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Wait.until(Page.visibleHeader, isVisible()),
            Ensure.that(Page.visibleHeader, isVisible()),
        )).to.be.fulfilled);

    /** @test {isVisible} */
    it('breaks the actor flow when element is not visible', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Ensure.that(Page.invisibleHeader, isVisible()),
        )).to.be.rejectedWith(AssertionError, `Expected the invisible header to become displayed`));

    /** @test {isVisible} */
    it('breaks the actor flow when element does not exist', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Ensure.that(Page.nonExistentHeader, isVisible()),
        )).to.be.rejectedWith(AssertionError, `Expected the non-existent header to become present`));

    /** @test {isVisible} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Page.visibleHeader, isVisible()).toString())
            .to.equal(`#actor ensures that the header does become visible`);
    });

    /** @test {isVisible} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Page.visibleHeader, isVisible()).toString())
            .to.equal(`#actor waits up to 5s until the header does become visible`);
    });
});
