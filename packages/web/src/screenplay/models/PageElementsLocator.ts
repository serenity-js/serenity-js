import type { Answerable, AnswersQuestions, ChainableMetaQuestion, UsesAbilities  } from '@serenity-js/core';
import { d, Question } from '@serenity-js/core';

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
            Question.about(d`page elements located ${ selector }`, async actor => {
                const bySelector  = await actor.answer(selector);
                const currentPage = await BrowseTheWeb.as<BrowseTheWeb<NET>>(actor).currentPage();

                return currentPage.locate(bySelector).locator;
            })
        );
    }

    private subject?: string;

    constructor(private readonly locator: Answerable<Locator<Native_Element_Type>>) {
        super();
    }

    of(parent: Answerable<PageElement<Native_Element_Type>>): Question<Promise<Array<PageElement<Native_Element_Type>>>> & ChainableMetaQuestion<PageElement<Native_Element_Type>, Question<Promise<Array<PageElement<Native_Element_Type>>>>> {
        return new PageElementsLocator(
            Question.about(this.toString() + d` of ${ parent }`, async actor => {
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

    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    toString(): string {
        return this.subject ?? d`${ this.locator }`;
    }
}
