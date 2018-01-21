import { step } from '@serenity-js/core/lib/recording';
import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { by, ElementFinder, protractor } from 'protractor';

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
    @step('{0} selects "#value" from #target')
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor)
            .locate(this.target)
            .element(by.cssContainingText('option', this.value))
            .click();
    }

    constructor(private value: string, private target: Target) {
    }

    toString = () => `#actor selects "${this.value}" from ${this.target}`;
}

class SelectOptions implements Interaction {
    @step('{0} selects "#values" from #target')
    performAs(actor: UsesAbilities): PromiseLike<void> {

        const hasRequiredText      = (option: ElementFinder) => option.getText().then(value => !!~this.values.indexOf(value)),
              isAlreadySelected    = (option: ElementFinder) => option.isSelected(),
              ensureOnlyOneApplies = (list: boolean[]) => list.filter(_ => _ === true).length === 1,
              select               = (option: ElementFinder) => option.click();

        const optionsToClick = (option: ElementFinder) => protractor.promise.all([
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
