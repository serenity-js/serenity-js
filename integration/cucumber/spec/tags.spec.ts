import { expect, ifExitCodeIsOtherThan, logOutput, Pick, SpawnResult } from '@integration/testing-tools';
import { SceneStarts, SceneTagged } from '@serenity-js/core/lib/events';
import { ArbitraryTag, FeatureTag } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';
import { CucumberRunner, cucumberVersions } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    given([
        ...cucumberVersions(1, 2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/register.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A tagged scenario')
            .toRun('features/tags.feature'),

        ...cucumberVersions(3, 4)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
            )
            .toRun('features/tags.feature'),
    ]).
    it('recognises tags on a scenario', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneStarts,  event => expect(event.value.name.value).to.equal('A tagged scenario'))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises tags at multiple levels')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('@feature-tag')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('@scenario-tag')))
            ;
        }));

    given([
        ...cucumberVersions(1, 2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/register.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'More tagged scenarios')
            .toRun('features/tags.feature'),

        ...cucumberVersions(3, 4)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
                '--name', 'More tagged scenarios',
            )
            .toRun('features/tags.feature'),
    ]).
    it('recognises tags on a scenario outline and its examples', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneStarts,  event => expect(event.value.name.value).to.equal('More tagged scenarios'))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises tags at multiple levels')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('@feature-tag')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('@scenario-outline-tag')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('@example-set-1')))
                .next(SceneStarts,  event => expect(event.value.name.value).to.equal('More tagged scenarios'))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises tags at multiple levels')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('@feature-tag')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('@scenario-outline-tag')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('@example-set-2')))
            ;
        }));
});
