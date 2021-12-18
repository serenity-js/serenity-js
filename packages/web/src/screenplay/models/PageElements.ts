import { Adapter, Answerable, format, LogicError, Mappable, Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';
import { PageElement } from './PageElement';

const d = format({ markQuestions: false });
const f = format({ markQuestions: true });

export abstract class PageElements<Native_Element_Root_Type = any, Native_Element_Collection_Type = any, Native_Element_Type = any>
    implements Mappable<PageElement<Native_Element_Root_Type, Native_Element_Type>, PageElements<Native_Element_Root_Type, Native_Element_Collection_Type, Native_Element_Type>>    // eslint-disable-line @typescript-eslint/indent
{
    // todo: childElements: Answerable<PageElements<NER, NEL, NE>> -> MetaQuestion
    static of<NER, NEC, NE>(
        childElements: Answerable<PageElements<NER, NEC, NE>>,
        parentElement: Answerable<PageElement<NER, NE>>
    ): Question<Promise<PageElements<NER, NEC, NE>>> & Adapter<PageElements<NER, NEC, NE>> {
        return Question.about(d `${ childElements } of ${ parentElement })`, async actor => {
            const children  = await actor.answer(childElements);
            const parent    = await actor.answer(parentElement);

            return children.of(parent);
        });
    }

    static locatedByCss<NER, NEC, NE>(selector: Answerable<string>): Question<Promise<PageElements<NER, NEC, NE>>> & Adapter<PageElements<NER, NEC, NE>> {
        return Question.about(f `page elements located by css (${selector})`, async actor => {
            const value = await actor.answer(selector);
            return BrowseTheWeb.as(actor).findAllByCss(value);
        });
    }

    static locatedByTagName<NER, NEC, NE>(selector: Answerable<string>): Question<Promise<PageElements<NER, NEC, NE>>> & Adapter<PageElements<NER, NEC, NE>> {
        return Question.about(f `page elements located by tag name (${selector})`, async actor => {
            const tagNameSelector = await actor.answer(selector);
            return BrowseTheWeb.as(actor).findAllByTagName(tagNameSelector);
        });
    }

    static locatedByXPath<NER, NEC, NE>(selector: Answerable<string>): Question<Promise<PageElements<NER, NEC, NE>>> & Adapter<PageElements<NER, NEC, NE>> {
        return Question.about(f `page elements located by xpath (${selector})`, async actor => {
            const xpathSelector = await actor.answer(selector);
            return BrowseTheWeb.as(actor).findAllByXPath(xpathSelector);
        });
    }

    constructor(
        protected readonly context: () => Promise<Native_Element_Root_Type> | Native_Element_Root_Type,
        protected readonly locator: (root: Native_Element_Root_Type) => Promise<Native_Element_Collection_Type> | Native_Element_Collection_Type
    ) {
    }

    abstract of(parent: PageElement<Native_Element_Root_Type, Native_Element_Type>): PageElements<Native_Element_Root_Type, Native_Element_Collection_Type, Native_Element_Type>;

    async nativeElementList(): Promise<Native_Element_Collection_Type> {
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
    abstract first(): Promise<PageElement<Native_Element_Root_Type, Native_Element_Type>>;
    abstract last(): Promise<PageElement<Native_Element_Root_Type, Native_Element_Type>>;
    abstract get(index: number): Promise<PageElement<Native_Element_Root_Type, Native_Element_Type>>;

    abstract map<Mapped_Type>(fn: (element: PageElement<Native_Element_Root_Type, Native_Element_Type>, index?: number, elements?: PageElements<Native_Element_Root_Type, Native_Element_Collection_Type, Native_Element_Type>) => Mapped_Type): Promise<Array<Awaited<Mapped_Type>>>;

    abstract filter(fn: (element: PageElement<Native_Element_Root_Type, Native_Element_Type>, index?: number) => Promise<boolean> | boolean): PageElements<Native_Element_Root_Type, Native_Element_Collection_Type, Native_Element_Type>;

    abstract forEach(fn: (element: PageElement<Native_Element_Root_Type, Native_Element_Type>, index?: number) => Promise<void> | void): Promise<void>;
}
