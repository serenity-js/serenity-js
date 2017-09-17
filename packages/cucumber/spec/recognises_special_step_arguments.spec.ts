import { ActivityFinished, ActivityStarts } from '@serenity-js/core/lib/domain';

import { lastOf } from './cucumber/last_of';
import { cucumber } from './cucumber/spawner';
import { expect } from './expect';

describe('When working with Cucumber', function() {

    this.timeout(5 * 1000);

    describe('Serenity/JS', () => {

        const messagesPerStep = 4;

        it ('reports data table arguments', () => {
            const spawned = cucumber('--tags', '@datatable', 'features/recognises_special_step_arguments.feature');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerStep);

                const
                    cucumberStepDescriptionFromActivityStartedMessage  = lastOf(ActivityStarts, spawned.messages).value.name,
                    cucumberStepDescriptionFromActivityFinishedMessage = lastOf(ActivityFinished, spawned.messages).value.subject.name;

                expect(cucumberStepDescriptionFromActivityStartedMessage).to.equal([
                    'Given the following accounts:',
                    '| name | email | twitter |',
                    '| Jan | jan.molak@serenity.io | @JanMolak |',
                    '| John | john.smart@serenity.io | @wakaleo |',
                ].join('\n'));

                expect(cucumberStepDescriptionFromActivityStartedMessage).
                    to.equal(cucumberStepDescriptionFromActivityFinishedMessage);
            });
        });

        it ('reports DocString arguments', () => {
            const spawned = cucumber('--tags', '@docstring', 'features/recognises_special_step_arguments.feature');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerStep);

                const
                    cucumberStepDescriptionFromActivityStartedMessage  = lastOf(ActivityStarts, spawned.messages).value.name,
                    cucumberStepDescriptionFromActivityFinishedMessage = lastOf(ActivityFinished, spawned.messages).value.subject.name;

                expect(cucumberStepDescriptionFromActivityStartedMessage).to.equal([
                    'Given an example.ts file with the following contents:',
                    'export const noop = (_) => _;',
                    'export const sum  = (a, b) => a + b;',
                ].join('\n'));

                expect(cucumberStepDescriptionFromActivityStartedMessage).
                    to.equal(cucumberStepDescriptionFromActivityFinishedMessage);
            });
        });
    });
});
