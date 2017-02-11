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

        const stepApiTypes = 3;
        const messagesPerStep = 4;
        const messagesPerFeature = stepApiTypes * messagesPerStep;

        it ('reports timed-out scenarios', () => {
            const spawned = protractor('**/*timed_out.feature');

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerFeature);

                const lastMessages = _.chunk(spawned.messages, messagesPerStep).map(chunk => chunk.pop());

                lastMessages.forEach(lastMessage => {
                    expect(lastMessage).to.be.instanceOf(SceneFinished);
                    expect(Result[lastMessage.value.result]).to.equal(Result[Result.ERROR]);
                    expect(lastMessage.value.error.message).to.match(/function timed out/);
                });
            });
        });
    });
});
