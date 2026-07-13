import { Ensure, includes } from '@serenity-js/assertions';
import { Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Tags', () => {

    describe('Feature Coverage', () => {

        it('navigates to filtered scenarios when selecting a tag', async ({ actor, tagsView }) => {
            await actor.attemptsTo(
                tagsView.open(),
                tagsView.selectTag('Todo List'),

                Ensure.that(Page.current().url().href, includes('#/tests')),
            );
        });
    });
});
