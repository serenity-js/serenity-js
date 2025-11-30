import { Ability, Log, Question } from '@serenity-js/core';
import { describe, it, test } from '@serenity-js/playwright-test';

const Message = () => Question.about(`message`, async actor => {
    return MyAbility.as(actor).message();
});

class MyAbility extends Ability {
    message = () => `Hello from ${ this.constructor.name }`
}

describe('Playwright Test reporting', () => {

    describe('A screenplay scenario', () => {

        test.use({
            defaultActorName: 'Alice',
            // eslint-disable-next-line no-empty-pattern
            extraAbilities: async ({ }, use) => {
                await use((actorName: string) => {
                    return actorName === 'Alice'
                        ? [ new MyAbility() ]
                        : [];
                })
            },
        });

        it(`has access to extra abilities for some actors`, async ({ actor }) => {
            await actor.attemptsTo(
                Log.the(Message())
            );
        });

        it(`has no access to extra abilities for other actors`, async ({ actorCalled }) => {
            // expect error since Bob does not have the required ability
            await actorCalled('Bob').attemptsTo(
                Log.the(Message())
            );
        });
    });
});
