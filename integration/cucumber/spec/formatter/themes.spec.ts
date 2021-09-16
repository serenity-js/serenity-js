import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneTagged } from '@serenity-js/core/lib/events';
import { CapabilityTag, FeatureTag, ThemeTag } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';
import { CucumberRunner, cucumberVersions } from '../../src';

describe('@serenity-js/cucumber', function () {

    given([
        ...cucumberVersions(1, 2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/index.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('promise')
            .toRun('features/example_theme/example_capability/example.feature'),

        ...cucumberVersions(3, 4, 5, 6)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('promise')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
            )
            .toRun('features/example_theme/example_capability/example.feature'),
    ]).
    it('recognises directories that group capabilities as themes', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            PickEvent.from(res.events)
                .next(SceneTagged,  event => expect(event.tag).to.equal(new ThemeTag('example_theme')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new CapabilityTag('example_capability')))
                .next(SceneTagged,  event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises capabilities and themes')))
            ;
        }));
});
