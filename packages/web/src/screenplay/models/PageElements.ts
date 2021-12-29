import { Answerable, AnswersQuestions, format, List, Question, UsesAbilities } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';
import { PageElement } from './PageElement';
import { Selector } from './selectors';

const f = format({ markQuestions: true });

export class PageElements<Native_Element_Type = any>
    extends List<PageElement<Native_Element_Type>>
{
    static located<NET, ST>(selector: Answerable<Selector<ST>>): PageElements<NET> {
        return new PageElements(selector);
    }

    /**
     * @param {Answerable<Selector<unknown>>} selector
     * @param {Answerable<PageElement>} [parent]
     *  if not specified, browser root selector is used
     */
    constructor(
        protected readonly selector: Answerable<Selector<unknown>>,
        private readonly parent?: Answerable<PageElement>
    ) {
        super(new PageElementCollection<Native_Element_Type>(selector, parent));
    }

    of(parent: Answerable<PageElement<Native_Element_Type>>): PageElements<Native_Element_Type> {
        return new PageElements<Native_Element_Type>(this.selector, parent)
            .describedAs(`<<${this.toString()}>>` + f`.of(${ parent })`);
    }
}

/**
 * @package
 */
class PageElementCollection<Native_Element_Type = any>
    extends Question<Promise<Array<PageElement<Native_Element_Type>>>>
{
    private subject: string;
    constructor(
        private readonly selector: Answerable<Selector<unknown>>,
        private readonly parent?: Answerable<PageElement>,
    ) {
        super();
        this.subject = `page elements located ${ selector.toString() }`;
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Array<PageElement<Native_Element_Type>>> {
        const bySelector = await actor.answer(this.selector);
        const parent     = await actor.answer(this.parent);

        return BrowseTheWeb.as(actor).locateAll(bySelector, parent ? parent.nativeElementLocator() : undefined);
    }

    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    toString(): string {
        return this.subject;
    }
}
