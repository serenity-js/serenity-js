import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { Attribute, by, Hover, Navigate, Target } from '../../../src';

/** @test {Hover} */
describe('Hover', function () {

    const Page = {
        header: Target.the('header').located(by.css('h1')),
        link:   Target.the('link').located(by.css('a')),
    };

    /** @test {Hover.over} */
    it('allows the actor to position the mouse cursor over a given target', () =>
        actorCalled('Mickey').attemptsTo(
            Navigate.to('/screenplay/interactions/hover/example.html'),

            Ensure.that(Attribute.called('class').of(Page.link), equals('off')),

            Hover.over(Page.link),
            Ensure.that(Attribute.called('class').of(Page.link), equals('on')),

            Hover.over(Page.header),
            Ensure.that(Attribute.called('class').of(Page.link), equals('off')),
        ));

    /** @test {Hover#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(Hover.over(Page.link).toString())
            .to.equal(`#actor hovers the mouse over the link`);
    });
});
