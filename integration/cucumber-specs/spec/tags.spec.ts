import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneStarts, SceneTagged } from '@serenity-js/core/lib/events';
import { ArbitraryTag, FeatureTag } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it('recognises tags on a scenario', () =>
        cucumber('features/tags.feature', 'common.steps.ts', ['--name', 'A tagged scenario'])
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,  event => expect(event.details.name.value).to.equal('A tagged scenario'))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises tags at multiple levels')))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('feature-tag')))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('scenario-tag')))
                ;
            })
    );

    it('recognises tags on a scenario outline and its examples', () =>
        cucumber('features/tags.feature', 'common.steps.ts', ['--name', 'More tagged scenarios'])
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,  event => expect(event.details.name.value).to.equal('More tagged scenarios'))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises tags at multiple levels')))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('feature-tag')))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('scenario-outline-tag')))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('example-set-1')))
                    .next(SceneStarts,  event => expect(event.details.name.value).to.equal('More tagged scenarios'))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises tags at multiple levels')))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('feature-tag')))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('scenario-outline-tag')))
                    .next(SceneTagged,  event => expect(event.tag).to.equal(new ArbitraryTag('example-set-2')))
                ;
            })
    );
});
