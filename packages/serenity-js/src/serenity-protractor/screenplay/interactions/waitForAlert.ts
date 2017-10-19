import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { protractor } from 'protractor';
import { BrowseTheWeb } from '../abilities/browse_the_web';

export class WaitForAlert implements Interaction {

    static toBePresent() {
        return new WaitForAlert();
    }

    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).wait(protractor.ExpectedConditions.alertIsPresent());
    }

}
