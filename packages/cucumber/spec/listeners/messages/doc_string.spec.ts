/* eslint-disable unicorn/filename-case,unicorn/prevent-abbreviations */
import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityStarts } from '@serenity-js/core/lib/events';
import { Name } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', () => {

    describe('when working with Cucumber 7', () => {

        it('recognises a scenario with a DocString step', () =>

            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/common.steps.ts',
                './examples/features/doc_string.feature',
            )
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
            }));
    });
});
