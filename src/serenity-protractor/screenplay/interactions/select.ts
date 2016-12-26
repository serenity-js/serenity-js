import { by, ElementFinder } from 'protractor';

import { Interaction, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Select {
    static theValue(value: string) {
        return { from: (target: Target): Interaction => new SelectOption(value, target) };
    }

    static values(...values: string[]) {
        return { from: (target: Target): Interaction => new SelectOptions(values, target) };
    }
}

class SelectOption implements Interaction {
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor)
            .locate(this.target)
            .element(by.cssContainingText('option', this.value))
            .click();
    }

    constructor(private value: string, private target: Target) {
    }
}

class SelectOptions implements Interaction {
    performAs(actor: UsesAbilities): PromiseLike<void> {

        const hasRequiredText      = (option: ElementFinder) => option.getText().then(value => !!~this.values.indexOf(value)),
              isAlreadySelected    = (option: ElementFinder) => option.isSelected(),
              ensureOnlyOneApplies = (list: boolean[]) => list.filter(_ => _ === true).length === 1,
              select               = (option: ElementFinder) => option.click();

        const optionsToClick = (option: ElementFinder) => Promise.all([
                hasRequiredText(option),
                isAlreadySelected(option),
            ])
            .then(ensureOnlyOneApplies);

        return BrowseTheWeb.as(actor).locate(this.target)
            .all(by.css('option'))
            .filter(optionsToClick)
            .each(select);
    }

    constructor(private values: string[], private target: Target) {
    }
}
