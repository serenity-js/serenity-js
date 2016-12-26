import expect = require('../../expect');

import { Result, SceneFinished } from '../../../src/serenity/domain';
import { spawner } from '../../support/spawner';

describe('When working with Cucumber', function () {

    this.timeout(30 * 1000);    // it might take a while to start up the selenium server

    const protractor = spawner(
        process.cwd() + '/node_modules/.bin/protractor',
        { cwd: __dirname, silent: true },
    );

    describe('Serenity/JS', () => {

        it ('reports passing scenarios', () => {
            let spawned = protractor('protractor.conf.js',
                '--specs', '**/*passing_scenario.feature',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(4);

                let lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.SUCCESS]);
            });
        });

        it ('ignores skipped scenarios', () => {
            let spawned = protractor('protractor.conf.js',
                '--specs', '**/*skipped_scenario.feature',
                '--cucumberOpts.tags', '~@wip',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(0);
            });
        });

        it ('reports pending scenarios', () => {
            let spawned = protractor('protractor.conf.js',
                '--specs', '**/*pending_scenario.feature',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(4);

                let lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.PENDING]);
            });
        });

        it('reports failing scenarios', () => {

            let spawned = protractor('protractor.conf.js',
                '--specs', '**/*failing_scenario.feature',
            );

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.lengthOf(4);

                let lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.FAILURE]);
            });
        });
    });
});
