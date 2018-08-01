import { expect, ifExitCodeIsOtherThan, logOutput } from '@integration/testing-tools';
import { ActivityStarts } from '@serenity-js/core/lib/events';
import { Name } from '@serenity-js/core/lib/model';

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
    it('recognises a scenario with a Data Table step', (stepInterface: string) =>
        cucumber(
            '--require', 'features/support/configure_serenity.ts',
            '--require', `features/step_definitions/${ stepInterface }.steps.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            'features/data_table.feature',
        ).
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            expect(res.events).to.have.lengthOf(6);

            Pick.from(res.events)
                .next(ActivityStarts, event => expect(event.value.name).to.equal(new Name(
                    'Given a step that receives a table:\n' +
                    '| Developer | Website |\n' +
                    '| Jan Molak | janmolak.com |',
                )))
            ;
        }));
});
