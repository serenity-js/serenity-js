import { expect, ifExitCodeIsOtherThan, logOutput, Pick, SpawnResult } from '@integration/testing-tools';
import { SceneTagged } from '@serenity-js/core/lib/events';
import { CapabilityTag, FeatureTag, ThemeTag } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';
import { CucumberRunner, cucumberVersions } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    given(
        cucumberVersions(1, 2)
            .thatRequire('features/support/configure_serenity.ts')
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .toRun('features/example_theme/example_capability/example.feature'),
    ).
    it('recognises directories that group capabilities as themes', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ThemeTag('example theme')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new CapabilityTag('example capability')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises capabilities and themes')))
            ;
        }));
});
