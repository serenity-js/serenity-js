import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityStarts } from '@serenity-js/core/lib/events';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it('recognises a scenario with a Data Table step', () =>
        cucumber('features/data_table.feature', 'common.steps.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(ActivityStarts, event => expect(event.details.name.value).to.match(new RegExp(
                        '^Given a step that receives a table:\\n' +
                        '| Developer | Website\\s+|\\n' +
                        '| Jan Molak | janmolak.com |',
                    )))
                ;
            })
    );
});
