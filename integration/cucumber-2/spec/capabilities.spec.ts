import { expect, ifExitCodeIsOtherThan, logOutput, Pick } from '@integration/testing-tools';
import { SceneDescriptionDetected, SceneFinished, SceneTagged } from '@serenity-js/core/lib/events';
import { CapabilityTag, Description, ExecutionSuccessful, FeatureTag } from '@serenity-js/core/lib/model';

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
    it('recognises directories features are grouped in as capabilities', (stepInterface: string) =>
        cucumber(
            '--require', 'features/support/configure_serenity.ts',
            '--require', `features/step_definitions/${ stepInterface }.steps.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            'features/example_capability/example.feature',
        ).
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('example capability')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises capabilities')))
            ;
        }));
});
