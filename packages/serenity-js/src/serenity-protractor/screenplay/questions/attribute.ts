import { Question, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Attribute {

    static of = (target: Target) => ({
        called: (name: string): Question<string> => new AttributeValue(target, name),
    })
}

class AttributeValue implements Question<string> {

    answeredBy(actor: UsesAbilities): PromiseLike<string> {
        return BrowseTheWeb.as(actor).locate(this.target).getAttribute(this.attribute);
    }

    constructor(private target: Target, private attribute: string) {
    }

    toString = () => `the value of the '${ this.attribute }' attribute of ${ this.target}`;
}
