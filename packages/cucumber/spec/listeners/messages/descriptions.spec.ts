import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { FeatureNarrativeDetected, SceneDescriptionDetected, SceneStarts } from '@serenity-js/core/lib/events';
import { Description, Name } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', () => {

    describe('when working with Cucumber 7', () => {

        it('recognises scenario descriptions', () =>

            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/common.steps.ts',
                './examples/features/descriptions.feature',
            )
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
            }));
    });
});
