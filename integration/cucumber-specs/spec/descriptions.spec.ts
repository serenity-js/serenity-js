import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { FeatureNarrativeDetected, SceneDescriptionDetected, SceneStarts } from '@serenity-js/core/lib/events';
import { Description, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it('recognises scenario descriptions', () =>
        cucumber('features/descriptions.feature', 'common.steps.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,              event => expect(event.details.name).to.equal(new Name('First scenario')))
                    .next(FeatureNarrativeDetected, event => {
                        expect(event.description).to.equal(new Description(
                            'In order to accurately report the scenario\n' +
                            'Serenity/JS should recognise all of its important parts',
                        ));
                    })
                    .next(SceneDescriptionDetected, event => {
                        expect(event.description).to.equal(new Description(
                            'A scenario where all the steps pass\nIs reported as passing',
                        ));
                    })
                ;
            })
    );
});
