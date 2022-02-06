import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityStarts } from '@serenity-js/core/lib/events';
import { Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it('recognises a scenario with a DocString step', () =>
        cucumber('features/doc_strings.feature', 'common.steps.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name(
                        'Given a step that receives a doc string:\n' +
                        'Dear customer,\n' +
                        '\n' +
                        'Please click this link to reset your password.',
                    )))
                ;
            })
    );
});
