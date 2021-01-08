import { defineParameterType, After, Before, Then, When } from '@cucumber/cucumber';
import { Actor, actorCalled, actorInTheSpotlight, Cast, engage, Interaction, serenity } from '@serenity-js/core';

const
    MakeAnArrow     = () => Interaction.where(`#actor makes an arrow`, actor => void 0),
    Nock            = () => Interaction.where(`#actor fits an arrow to the bowstring`, actor => void 0),
    Draw            = () => Interaction.where(`#actor draws the bow`, actor => void 0),
    Loose           = () => Interaction.where(`#actor releases the bowstring`, actor => void 0),
    RetrieveArrow   = () => Interaction.where(`#actor retrieves the arrow from the target`, actor => void 0);

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

Before(() =>
    serenity.theActorCalled('Lara').attemptsTo(
        MakeAnArrow(),
    ));

When('{actor} shoots an arrow', (actor: Actor) =>
    actor.attemptsTo(
        Nock(),
        Draw(),
        Loose(),
    ));

Then('{pronoun} should hit a target', (actor: Actor) =>
    actor.attemptsTo(
        // some assertion
    ));

After(() =>
    actorInTheSpotlight().attemptsTo(
        RetrieveArrow(),
    ));
