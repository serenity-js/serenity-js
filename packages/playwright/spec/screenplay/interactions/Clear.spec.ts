import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import chaiExclude from 'chai-exclude';
import { chromium, Page } from 'playwright';

import { BrowseTheWeb, Clear, Value } from '../../../src/screenplay';
import { Target } from '../../../src/screenplay/questions/targets';
import { chai } from '../../chai-extra';

chai.use(chaiExclude);
chai.should();

const { $ } = Target;

describe("'Clear' interaction", () => {
    const actor = actorCalled('Clara').whoCan(BrowseTheWeb.using(chromium));

    beforeEach(async () => {
        const page: Page = await (actor.abilityTo(BrowseTheWeb) as any).page();
        page.setContent(`
        <html>
            <input type="text" name="example" id="example" value="random text" />
        </html>`);
    });

    afterEach(() => {
        serenity.announce(new TestRunFinishes());
    });

    it('clears value in input', async () => {
        await actor.attemptsTo(
            Ensure.that(Value.of($("[id='example']")), equals('random text')),
            Clear.theValueOf($("[id='example']")),
            Ensure.that(Value.of($("[id='example']")), equals(''))
        );
    })
});
