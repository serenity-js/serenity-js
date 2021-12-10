import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, AssertionError, Duration } from '@serenity-js/core';
import { ErrorSerialiser } from '@serenity-js/core/lib/io';
import { isPresent, Navigate, PageElement, Wait } from '@serenity-js/web';

describe('isPresent', function () {

    const Page = {
        presentHeader:        PageElement.locatedByCss('h1').describedAs('the header'),
        nonExistentHeader:    PageElement.locatedByCss('h2').describedAs('the non-existent header'),
    };

    beforeEach(() =>
        actorCalled('Wendy').attemptsTo(
            Navigate.to('/expectations/is-present/hello_world.html'),
        ));

    /** @test {isPresent} */
    it('allows the actor flow to continue when the element is present in the DOM', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Wait.until(Page.presentHeader, isPresent()),
            Ensure.that(Page.presentHeader, isPresent()),
        )).to.be.fulfilled);

    /** @test {isPresent} */
    it('breaks the actor flow when element does not become present in the DOM', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Wait.upTo(Duration.ofMilliseconds(250)).until(Page.nonExistentHeader, isPresent()),
        )).to.be.rejectedWith(AssertionError, `Waited 250ms for the non-existent header to become present`));

    /** @test {isPresent} */
    it('breaks the actor flow when element is not present in the DOM', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Ensure.that(Page.nonExistentHeader, isPresent()),
        )).to.be.rejectedWith(AssertionError, `Expected the non-existent header to become present`));

    /** @test {isPresent} */
    it(`produces an assertion error that can be serialised with ErrorSerialiser`, () =>
        expect(actorCalled('Wendy').attemptsTo(
            Ensure.that(Page.nonExistentHeader, isPresent()),
        )).to.be.rejectedWith(AssertionError, `Expected the non-existent header to become present`)
            .then((error: AssertionError) => {
                expect(ErrorSerialiser.serialise(error)).to.be.a('string');
            }));

    /** @test {isPresent} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Page.presentHeader, isPresent()).toString())
            .to.equal(`#actor ensures that the header does become present`);
    });

    /** @test {isPresent} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Page.presentHeader, isPresent()).toString())
            .to.equal(`#actor waits up to 5s until the header does become present`);
    });
});
