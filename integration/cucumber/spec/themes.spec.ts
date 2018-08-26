import { expect, ifExitCodeIsOtherThan, logOutput } from '@integration/testing-tools';
import { SceneTagged } from '@serenity-js/core/lib/events';
import { CapabilityTag, FeatureTag, ThemeTag } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';

import { cucumber, Pick } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    given([
        'promise',
        'callback',
        'synchronous',
    ]).
    it('recognises directories that group capabilities as themes', (stepInterface: string) =>
        cucumber(
            '--require', 'features/support/configure_serenity.ts',
            '--require', `features/step_definitions/${ stepInterface }.steps.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            'features/example_theme/example_capability/example.feature',
        ).
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('example theme')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('example capability')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises capabilities and themes')))
            ;
        }));
});
