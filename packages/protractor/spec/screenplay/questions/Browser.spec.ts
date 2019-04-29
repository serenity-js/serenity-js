import { stage } from '@integration/testing-tools';
import { containAtLeastOneItemThat, Ensure, includes, property } from '@serenity-js/assertions';

import { Browser, Navigate } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Browser', () => {

    const Bernie = stage(new UIActors()).actor('Bernie');

    /** @test {Browser.log} */
    it('allows the actor to read the browser log entries', () => Bernie.attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html lang="en">
                <body>
                    <script>
                        console.log('Hello from the console!');
                    </script>
                </body>
            </html>
        `)),

        Ensure.that(Browser.log(), containAtLeastOneItemThat(property('message', includes('Hello from the console!')))),
    ));
});
