import { stage } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';

import { Navigate, Website } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Website', () => {

    const Bernie = stage(new UIActors()).actor('Bernie');

    describe('title', () => {
        /** @test {Attribute} */
        it('allows the actor to read an attribute of a DOM element', () => Bernie.attemptsTo(
            Navigate.to(pageFromTemplate(`
                <html>
                    <head>
                        <title>Hello World</title>
                    </head>
                </html>
            `)),

            Ensure.that(Website.title(), equals(`Hello World`)),
        ));
    });

    describe('url', () => {

        /** @test {Attribute} */
        it('allows the actor to read an attribute of a DOM element', () => Bernie.attemptsTo(
            Navigate.to(`chrome://accessibility/`),

            Ensure.that(Website.url(), equals(`chrome://accessibility/`)),
        ));
    });
});
