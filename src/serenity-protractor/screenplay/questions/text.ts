import { Question, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Text {
    static of(element: Target): Question<string> {
        return new TextOf(element);
    }

    static ofAll(elements: Target): Question<string[]> {
        return new TextOfAll(elements);
    }
}

class TextOf implements Question<string> {

    answeredBy(actor: UsesAbilities): PromiseLike<string> {
        return BrowseTheWeb.as(actor).locate(this.target).getText();
    }

    constructor(private target: Target) {
    }
}

class TextOfAll implements Question<string[]> {

    answeredBy(actor: UsesAbilities): PromiseLike<string[]> {
        // protractor ignores type definitions for the ElementArrayFinder
        // https://github.com/angular/protractor/blob/c3978ec166760ac07db01e700c4aaaa19d9b5c38/lib/element.ts#L92
        return <any> BrowseTheWeb.as(actor).locateAll(this.target).getText();
    }

    constructor(private target: Target) {
    }
}
