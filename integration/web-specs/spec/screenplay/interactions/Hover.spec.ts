import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { Attribute, By, Hover, Navigate, PageElement } from '@serenity-js/web';

describe('Hover', function () {

    const Page = {
        header: PageElement.located(By.css('h1')).describedAs('header'),
        link:   PageElement.located(By.css('a')).describedAs('the link'),
    };

    it('allows the actor to position the mouse cursor over a given target', () =>
        actorCalled('Mickey').attemptsTo(
            Navigate.to('/screenplay/interactions/hover/example.html'),

            Ensure.that(Attribute.called('class').of(Page.link), equals('off')),

            // hover on
            Hover.over(Page.link),

            Ensure.that(Attribute.called('class').of(Page.link), equals('on')),

            // hover off
            Hover.over(Page.header),

            Ensure.that(Attribute.called('class').of(Page.link), equals('off')),
        ));

    it('provides a sensible description of the interaction being performed', () => {
        expect(Hover.over(Page.link).toString())
            .to.equal(`#actor hovers the mouse over the link`);
    });

    it('correctly detects its invocation location', () => {
        const activity = Hover.over(Page.link);
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('Hover.spec.ts');
        expect(location.line).to.equal(38);
        expect(location.column).to.equal(32);
    });
});
