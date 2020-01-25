import { Interaction, serenity } from '@serenity-js/core';
import { After, Before, Then, When } from 'cucumber';

const
    MakeAnArrow     = () => Interaction.where(`#actor makes an arrow`, actor => void 0),
    Nock            = () => Interaction.where(`#actor fits an arrow to the bowstring`, actor => void 0),
    Draw            = () => Interaction.where(`#actor draws the bow`, actor => void 0),
    Loose           = () => Interaction.where(`#actor releases the bowstring`, actor => void 0),
    RetrieveArrow   = () => Interaction.where(`#actor retrieves the arrow from the target`, actor => void 0);

Before(() =>
    serenity.theActorCalled('Lara').attemptsTo(
        MakeAnArrow(),
    ));

When(/^(.*) shoots an arrow$/, (actorName: string) =>
    serenity.theActorCalled(actorName).attemptsTo(
        Nock(),
        Draw(),
        Loose(),
    ));

Then(/^she should hit a target$/, () =>
    serenity.theActorInTheSpotlight().attemptsTo(
        // some assertion
    ));

After(() =>
    serenity.theActorInTheSpotlight().attemptsTo(
        RetrieveArrow(),
    ));
