import expect = require('../../expect');

import * as _ from 'lodash';
import { Result, SceneFinished } from '../../../src/serenity/domain';
import { spawner } from '../../support/spawner';

describe('When working with Cucumber', function () {

    this.timeout(30 * 1000);    // it might take a while to start up the selenium server

    const protractor = spawner(
        process.cwd() + '/node_modules/.bin/protractor',
        { cwd: __dirname, silent: true },
    );

    describe('Serenity/JS', () => {

        // TODO: stepApiTypes = 4 when TS compile target e6 works and generator steps can be tested
        const stepApiTypes = 3;
        const messagesPerStep = 4;
        const messagesPerFeature = stepApiTypes * messagesPerStep;

        it ('reports passing scenarios', () => {
            let spawned = protractor('protractor.conf.js',
                '--specs', '**/*passing_scenario.feature',
                '--cucumberOpts.tags', '~@wip',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerFeature);

                let lastMessages = _.chunk(spawned.messages, messagesPerStep).map(chunk => chunk.pop());

                lastMessages.forEach(lastMessage => {
                    expect(lastMessage).to.be.instanceOf(SceneFinished);
                    expect(Result[lastMessage.value.result]).to.equal(Result[Result.SUCCESS]);
                });
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

        it ('reports implicitly pending scenarios', () => {
            let spawned = protractor('protractor.conf.js',
                '--specs', '**/*implicitly_pending_scenario.feature',
                '--cucumberOpts.tags', '~@wip',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerStep);

                let lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.PENDING]);
            });
        });

        it ('reports explicitly pending scenarios', () => {
            let spawned = protractor('protractor.conf.js',
                '--specs', '**/*explicitly_pending_scenario.feature',
                '--cucumberOpts.tags', '~@wip',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerFeature);

                let lastMessages = _.chunk(spawned.messages, messagesPerStep).map(chunk => chunk.pop());

                lastMessages.forEach(lastMessage => {
                    expect(lastMessage).to.be.instanceOf(SceneFinished);
                    expect(Result[lastMessage.value.result]).to.equal(Result[Result.PENDING]);
                });
            });
        });

        it('reports failing scenarios', () => {

            let spawned = protractor('protractor.conf.js',
                '--specs', '**/*failing_scenario.feature',
                '--cucumberOpts.tags', '~@wip',
            );

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerFeature);

                let lastMessages = _.chunk(spawned.messages, messagesPerStep).map(chunk => chunk.pop());

                lastMessages.forEach(lastMessage => {
                    expect(lastMessage).to.be.instanceOf(SceneFinished);
                    expect(Result[lastMessage.value.result]).to.equal(Result[Result.FAILURE]);
                });
            });
        });
    });
});
