import { ActivityFinished, ActivityStarts, RecordedScene, SceneFinished, SceneStarts, Tag } from '@serenity-js/core/lib/domain';

import { cucumber } from './cucumber/spawner';

import { expect } from './expect';

describe('When working with Cucumber', function() {

    this.timeout(5 * 1000);

    describe('Serenity/JS', () => {

        const Expected_Events = [
            { type: SceneStarts,      name: `Alice finds customer's email by their name` },
            { type: ActivityStarts,   name: `Adam starts up the customer database` },
            { type: ActivityFinished, name: `Adam starts up the customer database` },
            { type: ActivityStarts,   name: `Given Adam has added the following customer records to the database:` },
            { type: ActivityStarts,   name: `Adam adds a customer record for Bob` },
            { type: ActivityFinished, name: `Adam adds a customer record for Bob` },
            { type: ActivityFinished, name: `Given Adam has added the following customer records to the database:` },
            { type: ActivityStarts,   name: `When Alice looks for a customer called Bob` },
            { type: ActivityStarts,   name: `Alice looks for a customer called Bob` },
            { type: ActivityFinished, name: `Alice looks for a customer called Bob` },
            { type: ActivityFinished, name: `When Alice looks for a customer called Bob` },
            { type: ActivityStarts,   name: `Then she should see that the customer's email address is bob@megacorp.com` },
            { type: ActivityStarts,   name: `Alice checks if the found customer's email address is bob@megacorp.com` },
            { type: ActivityFinished, name: `Alice checks if the found customer's email address is bob@megacorp.com` },
            { type: ActivityFinished, name: `Then she should see that the customer's email address is bob@megacorp.com` },
            { type: ActivityStarts,   name: `Adam stops the customer database` },
            { type: ActivityFinished, name: `Adam stops the customer database` },
            { type: SceneFinished,    name: `Alice finds customer's email by their name` },
        ];

        it('recognises activities that happen before and after the scenario', () => {

            const spawned = cucumber(
                '--require',  'features/step_definitions/steps_with_activities.ts',
                'features/recognises_activities_of_actors_throughout_the_scenario.feature',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(Expected_Events.length);

                Expected_Events.forEach((e, i: number) => {
                    switch (e.type) {
                        case SceneStarts:
                        case ActivityStarts:
                            expect(spawned.messages[i].value.name).to.include(e.name);
                            break;
                        case ActivityFinished:
                        case SceneFinished:
                            expect(spawned.messages[i].value.subject.name).to.include(e.name);
                            break;
                        default:
                            throw new Error('Unexpected event');
                    }
                });
            });
        });
    });
});
