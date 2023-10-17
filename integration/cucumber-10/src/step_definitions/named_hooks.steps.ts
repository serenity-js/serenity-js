import { After, Before, defineParameterType, Given } from '@cucumber/cucumber';
import { Actor, actorCalled, actorInTheSpotlight, Interaction } from '@serenity-js/core';

const Perform = {
    in: (scope: string)  => Interaction.where(`#actor performs in ${ scope }`, () => void 0)
}

defineParameterType({
    regexp: /[A-Z][a-z]+/,
    transformer(name: string) {
        return actorCalled(name);
    },
    name: 'actor',
});

defineParameterType({
    regexp: /he|she|they|his|her|their/,
    transformer() {
        return actorInTheSpotlight();
    },
    name: 'pronoun',
});

Before({ name: 'Perform some setup in named Before hook' }, () =>
    actorCalled('Helen').attemptsTo(Perform.in('named Before hook'))
);

Given('{actor} fulfills a task', (actor: Actor) =>
    actor.attemptsTo(Perform.in('Given'))
);

After({ name: 'Perform some teardown in named After hook' }, () =>
    actorCalled('Helen').attemptsTo(Perform.in('named After hook'))
);
