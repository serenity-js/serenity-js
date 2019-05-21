import { Interaction, WithStage } from '@serenity-js/core';

const
    MakeAnArrow     = () => Interaction.where(`#actor makes an arrow`, actor => void 0),
    Nock            = () => Interaction.where(`#actor fits an arrow to the bowstring`, actor => void 0),
    Draw            = () => Interaction.where(`#actor draws the bow`, actor => void 0),
    Loose           = () => Interaction.where(`#actor releases the bowstring`, actor => void 0),
    RetrieveArrow   = () => Interaction.where(`#actor retrieves the arrow from the target`, actor => void 0);

export = function () {
    this.Before(function (this: WithStage) {
        return this.stage.theActorCalled('Lara').attemptsTo(
            MakeAnArrow(),
        );
    });

    this.When(/^(.*) shoots an arrow$/, function (this: WithStage, actorName: string) {
        return this.stage.theActorCalled(actorName).attemptsTo(
            Nock(),
            Draw(),
            Loose(),
        );
    });

    this.Then(/^she should hit a target$/, function (this: WithStage) {
        return this.stage.theActorInTheSpotlight().attemptsTo(
            // some assertion
        );
    });

    this.After(function (this: WithStage) {
        return this.stage.theActorCalled('Lara').attemptsTo(
            RetrieveArrow(),
        );
    });
};
