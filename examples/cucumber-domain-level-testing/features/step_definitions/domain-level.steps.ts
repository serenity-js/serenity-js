import { WithStage } from '@serenity-js/cucumber';
import { Then, When } from 'cucumber';

When(/(.*?) enters (\d+)/, function(this: WithStage, actorName: any, operandValue: string) {
    // todo: an empty attemptsTo should result in a pending step
    return this.stage.actor(actorName).attemptsTo(

    );
});

When(/(?:he|she|they) uses? the (.*) operator/, function(this: WithStage, operatorName: string) {
    return this.stage.currentActor().attemptsTo(

    );
});

Then(/(?:he|she|they) should get a result of (\d+)/, function(this: WithStage, expectedResult: string) {
    return this.stage.currentActor().attemptsTo(

    );
});
