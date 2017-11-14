import { Result, SceneFinished } from '@serenity-js/core/lib/domain';
import { spawner } from '../../support/spawner';

import expect = require('../../expect');

describe('When working with Cucumber', function() {

    this.timeout(30 * 1000);    // it might take a while to start up the selenium server

    const protractor = spawner(
        process.cwd() + '/node_modules/.bin/protractor',
        { cwd: __dirname, silent: true },
    );

    describe('Serenity/JS', () => {

        it('correctly sets the strict mode when required', () => {

            const spawned = protractor('protractor.conf.js',
                '--specs', '**/recognises_an_implicitly_pending_scenario.feature',
                '--cucumberOpts.strict', 'true',
            );

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                const lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.PENDING]);
            });
        });

        it('correctly disables the strict mode when required', () => {

            const spawned = protractor('protractor.conf.js',
                '--specs', '**/recognises_an_implicitly_pending_scenario.feature',
                '--cucumberOpts.strict', 'false',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                const lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.PENDING]);
            });
        });
    });
});
