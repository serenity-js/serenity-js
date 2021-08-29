import "mocha";

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import { chromium, Page } from 'playwright';

import { BrowseTheWeb, Close, Press, Value } from '../../../src/screenplay';
import { by, Target } from '../../../src/screenplay/questions/targets';

const { $ } = Target;

describe("'Press' interaction", () => {
    const actor = actorCalled('Ellie').whoCan(BrowseTheWeb.using(chromium));

    beforeEach(async () => {
        const page: Page = await (actor.abilityTo(BrowseTheWeb) as any).page();
        page.setContent(`
        <html>
            <input type="text" name="example" id="example" />
        </html>`);
    });

    afterEach(() => {
        actor.attemptsTo(Close.browser());
        serenity.announce(new TestRunFinishes());
    });

    it('presses keys', async () => {
        await actor.attemptsTo(
            Press.the('H', 'i', '!').in($(by.id('example'))),
            Ensure.that(Value.of($(by.id('example'))), equals('Hi!')),
            Press.the({
                key: 'ArrowLeft',
                modifiers: ['Shift']
            }, 'Shift+ArrowLeft', 'Shift+ArrowLeft', 'Backspace').in($(by.id('example'))),
            Ensure.that(Value.of($(by.id('example'))), equals(''))
        );
    })
});
