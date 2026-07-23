import { Ensure, includes, isGreaterThan, isLessThan, startsWith } from '@serenity-js/assertions';
import { Navigate, Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Navigation', () => {

    describe('Query Parameter Deep Links', () => {

        it('redirects ?route= to the corresponding hash route', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html?route=/tests'),

                Ensure.that(Page.current().url().hash, startsWith('#/tests')),
                Ensure.that(scenariosView.scenarioCount(), isGreaterThan(0)),
            );
        });

        it('forwards additional query params as hash-route parameters', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html?route=/tests&search=%40feature%3AAuthentication'),

                Ensure.that(Page.current().url().hash, includes('search=%40feature%3AAuthentication')),
                Ensure.that(scenariosView.scenarioCount(), isGreaterThan(0)),
                Ensure.that(scenariosView.scenarioCount(), isLessThan(24)),
            );
        });

        it('preserves hash routes when no ?route= param is present', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                Navigate.to('/index.html#/tests'),

                Ensure.that(Page.current().url().hash, startsWith('#/tests')),
                Ensure.that(scenariosView.scenarioCount(), isGreaterThan(0)),
            );
        });
    });
});
