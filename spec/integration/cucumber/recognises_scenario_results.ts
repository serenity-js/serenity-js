import expect = require('../../expect');

import * as _ from 'lodash';
import { Result, SceneFinished } from '../../../src/serenity/domain';
import { spawner } from '../../support/spawner';

describe('When working with Cucumber', function() {

    this.timeout(30 * 1000);    // it might take a while to start up the selenium server

    const protractorSpawner = spawner(
        process.cwd() + '/node_modules/.bin/protractor',
        { cwd: __dirname, silent: true },
    );

    const protractor = (specs: string) => protractorSpawner('protractor.conf.js',
        '--specs', specs,
        '--cucumberOpts.tags', '~@wip',
    );

    describe('Serenity/JS', () => {

        const stepApiTypes = 4;
        const messagesPerStep = 4;
        const messagesPerFeature = stepApiTypes * messagesPerStep;

        it ('reports passing scenarios', () => {
            const spawned = protractor('**/*passing_scenario.feature');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerFeature);

                const lastMessages = _.chunk(spawned.messages, messagesPerStep).map(chunk => chunk.pop());

                lastMessages.forEach(lastMessage => {
                    expect(lastMessage).to.be.instanceOf(SceneFinished);
                    expect(Result[lastMessage.value.result]).to.equal(Result[Result.SUCCESS]);
                });
            });
        });

        it ('ignores skipped scenarios', () => {
            const spawned = protractor('**/*skipped_scenario.feature');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(0);
            });
        });

        it ('reports implicitly pending scenarios', () => {
            const spawned = protractor('**/*implicitly_pending_scenario.feature');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerStep);

                const lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.PENDING]);
            });
        });

        it ('reports explicitly pending scenarios', () => {
            const spawned = protractor('**/*explicitly_pending_scenario.feature');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerFeature);

                const lastMessages = _.chunk(spawned.messages, messagesPerStep).map(chunk => chunk.pop());

                lastMessages.forEach(lastMessage => {
                    expect(lastMessage).to.be.instanceOf(SceneFinished);
                    expect(Result[lastMessage.value.result]).to.equal(Result[Result.PENDING]);
                });
            });
        });

        it('reports failing scenarios', () => {
            const spawned = protractor('**/*failing_scenario.feature');

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerFeature);

                const lastMessages = _.chunk(spawned.messages, messagesPerStep).map(chunk => chunk.pop());

                lastMessages.forEach(lastMessage => {
                    expect(lastMessage).to.be.instanceOf(SceneFinished);
                    expect(Result[lastMessage.value.result]).to.equal(Result[Result.FAILURE]);
                });
            });
        });
    });
});
