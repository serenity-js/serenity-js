import { ActivityFinished, Result, SceneFinished } from '@serenity-js/core/lib/domain';

import * as _ from 'lodash';
import { cucumber } from './cucumber/spawner';
import { expect } from './expect';

describe('When working with Cucumber', function() {

    this.timeout(10 * 1000);

    describe('Serenity/JS', () => {

        const stepApiTypes = 3;
        const messagesPerStep = 4;
        const messagesPerFeature = stepApiTypes * messagesPerStep;

        it ('reports passing scenarios', () => {
            const spawned = cucumber('features/recognises_a_passing_scenario.feature');

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
            const spawned = cucumber('--tags', '~@wip', 'features/recognises_a_skipped_scenario.feature');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(0);
            });
        });

        it ('reports implicitly pending scenarios', () => {
            const spawned = cucumber('features/recognises_an_implicitly_pending_scenario.feature');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerStep);

                const lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.PENDING]);
            });
        });

        it ('reports explicitly pending scenarios', () => {
            const spawned = cucumber('features/recognises_an_explicitly_pending_scenario.feature');

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
            const spawned = cucumber('features/recognises_a_failing_scenario.feature');

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.lengthOf(messagesPerFeature);

                const lastMessages = _.chunk(spawned.messages, messagesPerStep).map(chunk => chunk.pop());

                lastMessages.forEach(lastMessage => {
                    expect(lastMessage).to.be.instanceOf(SceneFinished);
                    expect(Result[lastMessage.value.result]).to.equal(Result[Result.FAILURE]);
                });
            });
        });

        it('reports ambiguous steps as errors and suggests how to fix them', () => {
            const spawned = cucumber(
                '--require',  'features/step_definitions/ambiguous.steps.ts',
                'features/recognises_ambiguous_steps.feature',
            );

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.lengthOf(4);

                const activityFinished = spawned.messages[2];

                expect(activityFinished).to.be.instanceOf(ActivityFinished);
                expect(Result[activityFinished.value.result]).to.equal(Result[Result.ERROR]);
                expect(activityFinished.value.error.message).to.equal(
                    'There should be only one step definition matching a given step, yet there seem to be several:\n' +
                    '/^Ambigail logs in as (.*@.*)$/ - features/step_definitions/ambiguous.steps.ts:3\n' +
                    '/^Ambigail logs in as (.*)/ - features/step_definitions/ambiguous.steps.ts:5',
                );

                const sceneFinished = spawned.messages[3];

                expect(sceneFinished).to.be.instanceOf(SceneFinished);
                expect(Result[sceneFinished.value.result]).to.equal(Result[Result.ERROR]);
            });
        });
    });
});
