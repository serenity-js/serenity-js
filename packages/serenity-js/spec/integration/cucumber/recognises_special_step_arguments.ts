import expect = require('../../expect');

import { spawner } from '../../support/spawner';

describe('When working with Cucumber', function() {

    this.timeout(30 * 1000);    // it might take a while to start up the selenium server

    const protractorSpawner = spawner(
        process.cwd() + '/node_modules/.bin/protractor',
        { cwd: __dirname, silent: true },
    );

    const protractor = (specs: string, tag: string) => protractorSpawner('protractor.conf.js',
        '--specs', specs,
        '--cucumberOpts.tags', tag,
    );

    describe('Serenity/JS', () => {

        const messagesPerStep = 4;

        it ('reports data table arguments', () => {
            const spawned = protractor('**/*special_step_arguments.feature', '@datatable');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerStep);

                const
                    cucumberStepDescriptionFromActivityStartedMessage  = spawned.messages[1].value.name,
                    cucumberStepDescriptionFromActivityFinishedMessage = spawned.messages[2].value.subject.name;

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
            const spawned = protractor('**/*special_step_arguments.feature', '@docstring');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerStep);

                const
                    cucumberStepDescriptionFromActivityStartedMessage  = spawned.messages[1].value.name,
                    cucumberStepDescriptionFromActivityFinishedMessage = spawned.messages[2].value.subject.name;

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
