import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, AssertionError, Duration, engage } from '@serenity-js/core';
import { ErrorSerialiser } from '@serenity-js/core/lib/io';
import { by, isPresent, Navigate, Target, Wait } from '@serenity-js/web';

import { pageFromTemplate } from '../fixtures';
import { UIActors } from '../UIActors';

describe('isPresent', function () {

    const Page = {
        Present_Header:         Target.the('header').located(by.tagName('h1')),
        Non_Existent_Header:    Target.the('non-existent header').located(by.tagName('h2')),
    };

    beforeEach(() => engage(new UIActors()));

    beforeEach(() => actorCalled('Bernie').attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html>
                <body>
                    <h1>Hello!</h1>
                </body>
            </html>
        `)),
    ));

    /** @test {isPresent} */
    it('allows the actor flow to continue when the element is present in the DOM', () => expect(actorCalled('Bernie').attemptsTo(
        Wait.until(Page.Present_Header, isPresent()),
        Ensure.that(Page.Present_Header, isPresent()),
    )).to.be.fulfilled);

    /** @test {isPresent} */
    it('breaks the actor flow when element does not become present in the DOM', () => expect(actorCalled('Bernie').attemptsTo(
        Wait.upTo(Duration.ofMilliseconds(250)).until(Page.Non_Existent_Header, isPresent()),
    )).to.be.rejectedWith(AssertionError, `Waited 250ms for the non-existent header to become present`));

    /** @test {isPresent} */
    it('breaks the actor flow when element is not present in the DOM', () => {
        return expect(actorCalled('Bernie').attemptsTo(
            Ensure.that(Page.Non_Existent_Header, isPresent()),
        )).to.be.rejectedWith(AssertionError, `Expected the non-existent header to become present`);
    });

    /** @test {isPresent} */
    it(`produces an assertion error that can be serialised with ErrorSerialiser`, () => {
        return expect(actorCalled('Bernie').attemptsTo(
            Ensure.that(Page.Non_Existent_Header, isPresent()),
        )).to.be.rejectedWith(AssertionError, `Expected the non-existent header to become present`)
            .then((error: AssertionError) => {
                expect(ErrorSerialiser.serialise(error)).to.be.a('string');
            });
    });

    /** @test {isPresent} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Page.Present_Header, isPresent()).toString())
            .to.equal(`#actor ensures that the header does become present`);
    });

    /** @test {isPresent} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Page.Present_Header, isPresent()).toString())
            .to.equal(`#actor waits up to 5s until the header does become present`);
    });
});
