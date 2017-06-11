import { Question, UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';

export class Website {
    static title = (): Question<PromiseLike<string>> => new WebsiteTitle();
}

class WebsiteTitle implements Question<PromiseLike<string>> {

    answeredBy(actor: UsesAbilities): PromiseLike<string> {
        return BrowseTheWeb.as(actor).getTitle();
    }

    toString = () => `the title of the current page`;
}
