import { Question, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class SelectedValue implements Question<PromiseLike<string>> {
    static of = (target: Target) => new SelectedValue(target);

    answeredBy(actor: UsesAbilities): PromiseLike<string> {
        return BrowseTheWeb.as(actor).locate(this.target).$('option:checked').getText();
    }

    constructor(private target: Target) {
    }

    toString = () => `the selected value of ${ this.target }`;
}

export class SelectedValues implements Question<PromiseLike<string>> {
    static of(target: Target) {
        return new SelectedValues(target);
    }

    answeredBy(actor: UsesAbilities): PromiseLike<string> {
        return BrowseTheWeb.as(actor).locate(this.target).$$('option').filter(option => option.isSelected()).getText();
    }

    constructor(private target: Target) {
    }

    toString = () => `the selected values of ${ this.target }`;
}
