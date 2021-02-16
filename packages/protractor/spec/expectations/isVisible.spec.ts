import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, AssertionError, engage } from '@serenity-js/core';
import { by } from 'protractor';

import { isVisible, Navigate, Target, Wait } from '../../src';
import { pageFromTemplate } from '../fixtures';
import { UIActors } from '../UIActors';

describe('isVisible', function () {

    const Page = {
        Visible_Header:        Target.the('header').located(by.tagName('h1')),
        Invisible_Header:      Target.the('invisible header').located(by.tagName('h2')),
        Non_Existent_Header:   Target.the('non-existent header').located(by.tagName('h3')),
    };

    beforeEach(() => engage(new UIActors()));

    beforeEach(() => actorCalled('Bernie').attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html>
                <body>
                    <h1>visible</h1>
                    <h2 style="display:none;">invisible</h2>
                </body>
            </html>
        `)),
    ));

    /** @test {isVisible} */
    it('allows the actor flow to continue when the element is visible', () => expect(actorCalled('Bernie').attemptsTo(
        Wait.until(Page.Visible_Header, isVisible()),
        Ensure.that(Page.Visible_Header, isVisible()),
    )).to.be.fulfilled);

    /** @test {isVisible} */
    it('breaks the actor flow when element is not visible', () => {
        return expect(actorCalled('Bernie').attemptsTo(
            Ensure.that(Page.Invisible_Header, isVisible()),
        )).to.be.rejectedWith(AssertionError, `Expected the invisible header to become displayed`);
    });

    /** @test {isVisible} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Page.Visible_Header, isVisible()).toString())
            .to.equal(`#actor ensures that the header does become visible`);
    });

    /** @test {isVisible} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Page.Visible_Header, isVisible()).toString())
            .to.equal(`#actor waits up to 5s until the header does become visible`);
    });
});
