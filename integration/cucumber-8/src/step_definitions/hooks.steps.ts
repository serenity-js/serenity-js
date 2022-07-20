import { After, AfterAll, AfterStep, Before, BeforeAll, BeforeStep, defineParameterType, Given } from '@cucumber/cucumber';
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

BeforeAll(() =>
    actorCalled('Helen').attemptsTo(Perform.in('BeforeAll'))
);

Before(() =>
    actorCalled('Helen').attemptsTo(Perform.in('Before'))
);

BeforeStep(() =>
    actorCalled('Helen').attemptsTo(Perform.in('BeforeStep'))
);

Given('{actor} fulfills a task', (actor: Actor) =>
    actor.attemptsTo(Perform.in('Given'))
);

AfterStep(() =>
    actorCalled('Helen').attemptsTo(Perform.in('AfterStep'))
);

After(() =>
    actorCalled('Helen').attemptsTo(Perform.in('After'))
);

AfterAll(() =>
    actorCalled('Helen').attemptsTo(Perform.in('AfterAll'))
);
