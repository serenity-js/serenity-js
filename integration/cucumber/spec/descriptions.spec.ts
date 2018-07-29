import { expect, ifExitCodeIsOtherThan, logOutput } from '@integration/testing-tools';
import { SceneDescriptionDetected, SceneStarts } from '@serenity-js/core/lib/events';
import { Description, Name } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';

import { cucumber, Pick } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    given([
        'synchronous',
        'promise',
        'callback',
    ]).
    it('recognises scenario descriptions', (stepInterface: string) =>
        cucumber(
            '--require', 'features/support/configure_serenity.ts',
            '--require', `features/step_definitions/${ stepInterface }.steps.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            'features/descriptions.feature',
        ).
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            expect(res.events).to.have.lengthOf(7);

            Pick.from(res.events)
                .next(SceneStarts,              event => expect(event.value.name).to.equal(new Name('First scenario')))
                .next(SceneDescriptionDetected, event => {
                    expect(event.description).to.equal(new Description(
                        'A scenario where all the steps pass\nIs reported as passing',
                    ));
                })
            ;
        }));
});
