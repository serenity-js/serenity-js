import { Adapter, Answerable, format, LogicError, Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';
import { PageElement } from './PageElement';

const d = format({ markQuestions: false });
const f = format({ markQuestions: true });

export abstract class PageElements<NativeElementContext = any, NativeElementList = any, NativeElement = any>
// todo: implements List (Attribute.spec.ts)
{
    static of(childElements: Answerable<PageElements>, parentElement: Answerable<PageElement>): Question<Promise<PageElements>> & Adapter<PageElements> {
        return Question.about(d `${ childElements } of ${ parentElement })`, async actor => {
            const children  = await actor.answer(childElements);
            const parent    = await actor.answer(parentElement);

            return children.of(parent);
        });
    }

    static locatedByCss(selector: Answerable<string>): Question<Promise<PageElements>> & Adapter<PageElements> {
        return Question.about(f `page elements located by css (${selector})`, async actor => {
            const value = await actor.answer(selector);
            return BrowseTheWeb.as(actor).findAllByCss(value);
        });
    }

    static locatedByTagName(selector: Answerable<string>): Question<Promise<PageElements>> & Adapter<PageElements> {
        return Question.about(f `page elements located by tag name (${selector})`, async actor => {
            const tagNameSelector = await actor.answer(selector);
            return BrowseTheWeb.as(actor).findAllByTagName(tagNameSelector);
        });
    }

    static locatedByXPath(selector: Answerable<string>): Question<Promise<PageElements>> & Adapter<PageElements> {
        return Question.about(f `page elements located by xpath (${selector})`, async actor => {
            const xpathSelector = await actor.answer(selector);
            return BrowseTheWeb.as(actor).findAllByXPath(xpathSelector);
        });
    }

    constructor(
        protected readonly context: () => Promise<NativeElementContext> | NativeElementContext,
        protected readonly locator: (root: NativeElementContext) => Promise<NativeElementList> | NativeElementList
    ) {
    }

    abstract of(parent: PageElement): PageElements;

    async nativeElementList(): Promise<NativeElementList> {
        try {
            const context = await this.context();
            return this.locator(context);
        }
        catch (error) {
            throw new LogicError(`Couldn't find elements`, error);
        }
    }

    abstract count(): Promise<number>;
    abstract first(): Promise<PageElement<NativeElementContext, NativeElement>>;
    abstract last(): Promise<PageElement<NativeElementContext, NativeElement>>;
    abstract get(index: number): Promise<PageElement<NativeElementContext, NativeElement>>;

    abstract map<O>(fn: (element: PageElement, index?: number, elements?: PageElements) => Promise<O> | O): Promise<O[]>;

    abstract filter(fn: (element: PageElement, index?: number) => Promise<boolean> | boolean): PageElements;

    abstract forEach(fn: (element: PageElement, index?: number) => Promise<void> | void): Promise<void>;
}
