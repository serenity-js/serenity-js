import { Question, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

import { ElementFinder } from 'protractor';

export class WebElement implements Question<ElementFinder> {

    static of(target: Target) {
        return new WebElement(target);
    }

    answeredBy(actor: UsesAbilities) {
        return BrowseTheWeb.as(actor).locate(this.target);
    }

    constructor(private target: Target) {
    }
}
