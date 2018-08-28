import { expect, ifExitCodeIsOtherThan, logOutput, Pick, SpawnResult } from '@integration/testing-tools';
import { ActivityStarts } from '@serenity-js/core/lib/events';
import { Name } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';
import { CucumberRunner, cucumberVersions } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    given(
        cucumberVersions(1, 2)
            .thatRequire('features/support/configure_serenity.ts')
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .toRun('features/data_table.feature'),
    ).
    it('recognises a scenario with a Data Table step', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(ActivityStarts, event => expect(event.value.name).to.equal(new Name(
                    'Given a step that receives a table:\n' +
                    '| Developer | Website |\n' +
                    '| Jan Molak | janmolak.com |',
                )))
            ;
        }));
});
