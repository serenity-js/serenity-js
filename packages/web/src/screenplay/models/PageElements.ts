import { Answerable, List, MetaQuestion, Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';
import { Locator } from './Locator';
import { PageElement } from './PageElement';
import { Selector } from './selectors';

/**
 * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to identify
 * a group of Web elements located by {@apilink Selector}.
 *
 * ## Learn more
 *
 * - [Page Element Query Language](/handbook/web-testing/page-element-query-language)
 * - {@apilink List}
 * - {@apilink MetaQuestion}
 *
 * @group Models
 */
export class PageElements<Native_Element_Type = any>
    extends List<PageElement<Native_Element_Type>>
    implements MetaQuestion<Answerable<PageElement<Native_Element_Type>>, Promise<Array<PageElement<Native_Element_Type>>>>
{
    static located<NET>(selector: Answerable<Selector>): PageElements<NET> {
        return new PageElements(relativeToDocumentRoot(selector));
    }

    /**
     * @param locator
     */
    constructor(protected readonly locator: Answerable<Locator<Native_Element_Type>>) {
        super(allElementsOf(locator));
    }

    of(parent: Answerable<PageElement<Native_Element_Type>>): PageElements<Native_Element_Type> {
        return new PageElements<Native_Element_Type>(relativeToParent(this.locator, parent))
            .describedAs(`${ this.toString() } of ${ parent }`);
    }
}

/**
 * @package
 */
function relativeToDocumentRoot<Native_Element_Type>(selector: Answerable<Selector>): Question<Promise<Locator<Native_Element_Type>>> {
    return Question.about(String(selector), async actor => {
        const bySelector  = await actor.answer(selector);
        const currentPage = await BrowseTheWeb.as<BrowseTheWeb<Native_Element_Type>>(actor).currentPage();

        return currentPage.locate(bySelector).locator;
    });
}

/**
 * @package
 */
function relativeToParent<Native_Element_Type>(relativeLocator: Answerable<Locator<Native_Element_Type>>, parent: Answerable<PageElement<Native_Element_Type>>): Question<Promise<Locator<Native_Element_Type>>> {
    return Question.about(`${ relativeLocator.toString() } of ${ parent }`, async actor => {
        const locator: Locator<Native_Element_Type>             = await actor.answer(relativeLocator);
        const parentElement: PageElement<Native_Element_Type>   = await actor.answer(parent);

        return locator.of(parentElement.locator);
    });
}

/**
 * @package
 */
function allElementsOf<Native_Element_Type>(locator: Answerable<Locator<Native_Element_Type>>): Question<Promise<Array<PageElement<Native_Element_Type>>>> {
    return Question.about(`page elements located ${ String(locator) }`, async actor => {
        const resolved: Locator<Native_Element_Type> = await actor.answer(locator);
        return resolved.allElements();
    });
}
