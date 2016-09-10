import { Question, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';

export class Website {
    static title(): Question<string> {
        return new WebsiteTitle();
    }
}

class WebsiteTitle implements Question<string> {

    answeredBy(actor: UsesAbilities): PromiseLike<string> {
        return BrowseTheWeb.as(actor).getTitle();
    }
}
