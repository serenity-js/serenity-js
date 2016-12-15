import { Question, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class SelectedValue implements Question<string> {
    static of(target: Target) {
        return new SelectedValue(target);
    }

    answeredBy(actor: UsesAbilities): PromiseLike<string> {
        return BrowseTheWeb.as(actor).locate(this.target).$('option:checked').getText();
    }

    constructor(private target: Target) {
    }
}

export class SelectedValues implements Question<string> {
    static of(target: Target) {
        return new SelectedValues(target);
    }

    answeredBy(actor: UsesAbilities): PromiseLike<string> {
        return BrowseTheWeb.as(actor).locate(this.target).$$('option').filter(option => option.isSelected()).getText();
    }

    constructor(private target: Target) {
    }
}
