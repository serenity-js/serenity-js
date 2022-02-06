import { Interaction, serenity } from '@serenity-js/core';

const
    MakeAnArrow     = () => Interaction.where(`#actor makes an arrow`, actor => void 0),
    Nock            = () => Interaction.where(`#actor fits an arrow to the bowstring`, actor => void 0),
    Draw            = () => Interaction.where(`#actor draws the bow`, actor => void 0),
    Loose           = () => Interaction.where(`#actor releases the bowstring`, actor => void 0),
    RetrieveArrow   = () => Interaction.where(`#actor retrieves the arrow from the target`, actor => void 0);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export = function () {
    this.Before(() =>
        serenity.theActorCalled('Lara').attemptsTo(
            MakeAnArrow(),
        ));

    this.When(/^(.*) shoots an arrow$/, (actorName: string) =>
        serenity.theActorCalled(actorName).attemptsTo(
            Nock(),
            Draw(),
            Loose(),
        ));

    this.Then(/^she should hit a target$/, () =>
        serenity.theActorInTheSpotlight().attemptsTo(
            // some assertion
        ));

    this.After(() =>
        serenity.theActorInTheSpotlight().attemptsTo(
            RetrieveArrow(),
        ));
};
