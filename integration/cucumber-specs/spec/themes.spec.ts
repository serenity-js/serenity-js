import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneTagged } from '@serenity-js/core/lib/events';
import { CapabilityTag, FeatureTag, ThemeTag } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it('recognises directories that group capabilities as themes', () =>
        cucumber('features/example_theme/example_capability/example.feature', 'common.steps.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new ThemeTag('Example theme')))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new CapabilityTag('Example capability')))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises capabilities and themes')))
                ;
            }));
});
