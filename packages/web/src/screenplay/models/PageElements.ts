import { Adapter, Answerable, format, LogicError, Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';
import { PageElement } from './PageElement';

const d = format({ markQuestions: false });
const f = format({ markQuestions: true });

export abstract class PageElements<NativeElementRoot = any, NativeElementList = any, NativeElement = any>
// todo: implements List (Attribute.spec.ts)
{
    static of<NER, NEL, NE>(childElements: Answerable<PageElements<NER, NEL, NE>>, parentElement: Answerable<PageElement<NER, NE>>): Question<Promise<PageElements<NER, NEL, NE>>> & Adapter<PageElements<NER, NEL, NE>> {
        return Question.about(d `${ childElements } of ${ parentElement })`, async actor => {
            const children  = await actor.answer(childElements);
            const parent    = await actor.answer(parentElement);

            return children.of(parent);
        });
    }

    static locatedByCss<NER, NEL, NE>(selector: Answerable<string>): Question<Promise<PageElements<NER, NEL, NE>>> & Adapter<PageElements<NER, NEL, NE>> {
        return Question.about(f `page elements located by css (${selector})`, async actor => {
            const value = await actor.answer(selector);
            return BrowseTheWeb.as(actor).findAllByCss(value);
        });
    }

    static locatedByTagName<NER, NEL, NE>(selector: Answerable<string>): Question<Promise<PageElements<NER, NEL, NE>>> & Adapter<PageElements<NER, NEL, NE>> {
        return Question.about(f `page elements located by tag name (${selector})`, async actor => {
            const tagNameSelector = await actor.answer(selector);
            return BrowseTheWeb.as(actor).findAllByTagName(tagNameSelector);
        });
    }

    static locatedByXPath<NER, NEL, NE>(selector: Answerable<string>): Question<Promise<PageElements<NER, NEL, NE>>> & Adapter<PageElements<NER, NEL, NE>> {
        return Question.about(f `page elements located by xpath (${selector})`, async actor => {
            const xpathSelector = await actor.answer(selector);
            return BrowseTheWeb.as(actor).findAllByXPath(xpathSelector);
        });
    }

    constructor(
        protected readonly context: () => Promise<NativeElementRoot> | NativeElementRoot,
        protected readonly locator: (root: NativeElementRoot) => Promise<NativeElementList> | NativeElementList
    ) {
    }

    abstract of(parent: PageElement<NativeElementRoot, NativeElement>): PageElements<NativeElementRoot, NativeElementList, NativeElement>;

    async nativeElementList(): Promise<NativeElementList> {
        try {
            const context = await this.context();
            return this.locator(context);
        }
        catch (error) {
            throw new LogicError(`Couldn't find elements`, error);
        }
    }

    // todo: delegate to List
    abstract count(): Promise<number>;
    abstract first(): Promise<PageElement<NativeElementRoot, NativeElement>>;
    abstract last(): Promise<PageElement<NativeElementRoot, NativeElement>>;
    abstract get(index: number): Promise<PageElement<NativeElementRoot, NativeElement>>;

    abstract map<O>(fn: (element: PageElement<NativeElementRoot, NativeElement>, index?: number, elements?: PageElements<NativeElementRoot, NativeElementList, NativeElement>) => Promise<O> | O): Promise<O[]>;

    abstract filter(fn: (element: PageElement<NativeElementRoot, NativeElement>, index?: number) => Promise<boolean> | boolean): PageElements<NativeElementRoot, NativeElementList, NativeElement>;

    abstract forEach(fn: (element: PageElement<NativeElementRoot, NativeElement>, index?: number) => Promise<void> | void): Promise<void>;
}
