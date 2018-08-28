import { expect, ifExitCodeIsOtherThan, logOutput, Pick, SpawnResult } from '@integration/testing-tools';
import { FeatureNarrativeDetected, SceneDescriptionDetected, SceneStarts } from '@serenity-js/core/lib/events';
import { Description, Name } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';
import { CucumberRunner, cucumberVersions } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    given(
        cucumberVersions(1, 2)
            .thatRequire('features/support/configure_serenity.ts')
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .toRun('features/descriptions.feature'),
    ).
    it('recognises scenario descriptions', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneStarts,              event => expect(event.value.name).to.equal(new Name('First scenario')))
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
