import type { Answerable, AnswersQuestions, ChainableMetaQuestion, UsesAbilities } from '@serenity-js/core';
import { Question, the } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';
import type { Locator } from './Locator';
import type { PageElement } from './PageElement';
import type { Selector } from './selectors';

/**
 * @group Models
 */
export class PageElementsLocator<Native_Element_Type = any>
    extends Question<Promise<Array<PageElement<Native_Element_Type>>>>
    implements ChainableMetaQuestion<PageElement<Native_Element_Type>, Question<Promise<Array<PageElement<Native_Element_Type>>>>>
{
    static fromDocumentRoot<NET>(selector: Answerable<Selector>): PageElementsLocator<NET> {
        return new PageElementsLocator(
            Question.about(the`page elements located ${ selector }`, async actor => {
                const bySelector  = await actor.answer(selector);
                const currentPage = await BrowseTheWeb.as<BrowseTheWeb<NET>>(actor).currentPage();

                return currentPage.locate(bySelector).locator;
            })
        );
    }

    constructor(private readonly locator: Answerable<Locator<Native_Element_Type>>) {
        super(the`${ locator }`);
    }

    of(parent: Answerable<PageElement<Native_Element_Type>>): Question<Promise<Array<PageElement<Native_Element_Type>>>> & ChainableMetaQuestion<PageElement<Native_Element_Type>, Question<Promise<Array<PageElement<Native_Element_Type>>>>> {
        return new PageElementsLocator(
            Question.about(the`${ this } of ${ parent }`, async actor => {
                const locator: Locator<Native_Element_Type>             = await actor.answer(this.locator);
                const parentElement: PageElement<Native_Element_Type>   = await actor.answer(parent);

                return locator.of(parentElement.locator);
            })
        );
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Array<PageElement<Native_Element_Type>>> {
        const resolved: Locator<Native_Element_Type> = await actor.answer(this.locator);
        return resolved.allElements();
    }
}
