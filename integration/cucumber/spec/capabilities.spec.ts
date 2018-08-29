import { expect, ifExitCodeIsOtherThan, logOutput, Pick, SpawnResult } from '@integration/testing-tools';
import { SceneTagged } from '@serenity-js/core/lib/events';
import { CapabilityTag, FeatureTag } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';
import { CucumberRunner, cucumberVersions } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    given([
        ...cucumberVersions(1, 2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/register.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .toRun('features/example_capability/example.feature'),

        ...cucumberVersions(3, 4)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
            )
            .toRun('features/example_capability/example.feature'),
    ]).
    it('recognises directories features are grouped in as capabilities', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('example capability')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises capabilities')))
            ;
        }));
});
