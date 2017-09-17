import { Result, SceneFinished } from '@serenity-js/core/lib/domain';
import { cucumber } from './cucumber/spawner';

import { expect } from './expect';

import * as _ from 'lodash';

describe('When working with Cucumber', function() {

    this.timeout(5 * 1000);

    describe('Serenity/JS', () => {

        const stepApiTypes = 2;
        const messagesPerStep = 4;
        const messagesPerFeature = stepApiTypes * messagesPerStep;

        it ('reports timed-out scenarios', () => {
            const spawned = cucumber('features/recognises_tests_that_timed_out.feature');

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
