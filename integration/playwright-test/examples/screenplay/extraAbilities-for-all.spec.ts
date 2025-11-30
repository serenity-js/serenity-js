import { Ability, Log, Question } from '@serenity-js/core';
import { describe, it, test } from '@serenity-js/playwright-test';

class MyAbility extends Ability {
    message = () => `Hello from ${ this.constructor.name }`
}

const Message = () => Question.about(`message`, async actor => {
    return MyAbility.as(actor).message();
});

describe('Playwright Test reporting', () => {

    describe('A screenplay scenario', () => {

        test.use({
            defaultActorName: 'Alice',
            extraAbilities: [ new MyAbility() ]
        });

        it(`has access to extra abilities`, async ({ actor }) => {
            await actor.attemptsTo(
                Log.the(Message())
            );
        });
    });
});
