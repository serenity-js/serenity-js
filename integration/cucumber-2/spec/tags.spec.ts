import { expect, ifExitCodeIsOtherThan, logOutput, Pick } from '@integration/testing-tools';
import { SceneStarts, SceneTagged } from '@serenity-js/core/lib/events';
import { ArbitraryTag, FeatureTag } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';

import { cucumber } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    given([
        'promise',
        'callback',
        'synchronous',
    ]).
    it('recognises tags on a scenario', (stepInterface: string) =>
        cucumber(
            '--require', 'features/support/configure_serenity.ts',
            '--require', `features/step_definitions/${ stepInterface }.steps.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            'features/tags.feature',
            '--name', 'A tagged scenario',
        ).
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name.value).to.equal('A tagged scenario'))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises tags at multiple levels')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('@feature-tag')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('@scenario-tag')))
            ;
        }));

    given([
        'promise',
        'callback',
        'synchronous',
    ]).
    it('recognises tags on a scenario outline and its examples', (stepInterface: string) =>
        cucumber(
            '--require', 'features/support/configure_serenity.ts',
            '--require', `features/step_definitions/${ stepInterface }.steps.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            'features/tags.feature',
            '--name', 'More tagged scenarios',
        ).
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name.value).to.equal('More tagged scenarios'))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises tags at multiple levels')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('@feature-tag')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('@scenario-outline-tag')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('@example-set-1')))
                .next(SceneStarts,         event => expect(event.value.name.value).to.equal('More tagged scenarios'))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises tags at multiple levels')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('@feature-tag')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('@scenario-outline-tag')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('@example-set-2')))
            ;
        }));
});
