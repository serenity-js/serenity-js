import { Ensure, isPresent } from '@serenity-js/assertions';
import { By, PageElement } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Dashboard', () => {

    describe('Quality Trends', () => {

        it('renders a trend chart showing quality across runs', async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that(PageElement.located(By.css('canvas')).describedAs('trend chart'), isPresent()),
            );
        });
    });
});
