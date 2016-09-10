import { Question, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Attribute {

    static of (target: Target): Attribute {
        return new Attribute(target);
    }

    called (name: string): Question<string> {
        return new AttributeValue(this.target, name);
    }

    constructor(private target: Target) {
    }
}

class AttributeValue implements Question<string> {

    answeredBy(actor: UsesAbilities): PromiseLike<string> {
        return BrowseTheWeb.as(actor).locate(this.target).getAttribute(this.attribute);
    }

    constructor(private target: Target, private attribute: string) {
    }
}
