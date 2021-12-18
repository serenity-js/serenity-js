import { Adapter, Answerable, format, LogicError, Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';

const d = format({ markQuestions: false });
const f = format({ markQuestions: true });

export abstract class PageElement<Native_Element_Root_Type = any, Native_Element_Type = any> {
    static of<NER, NE>(childElement: Answerable<PageElement<NER, NE>>, parentElement: Answerable<PageElement<NER, NE>>): Question<Promise<PageElement<NER, NE>>> & Adapter<PageElement<NER, NE>> {
        return Question.about(d`${ childElement } of ${ parentElement })`, async actor => {
            const child     = await actor.answer(childElement);
            const parent    = await actor.answer(parentElement);

            return child.of(parent);
        });
    }

    static locatedByCss<NER, NE>(selector: Answerable<string>): Question<Promise<PageElement<NER, NE>>> & Adapter<PageElement<NER, NE>> {
        return Question.about(f`page element located by css (${selector})`, async actor => {
            const cssSelector = await actor.answer(selector);

            return BrowseTheWeb.as(actor).findByCss(cssSelector);
        });
    }

    static locatedByCssContainingText<NER, NE>(selector: Answerable<string>, text: Answerable<string>): Question<Promise<PageElement<NER, NE>>> & Adapter<PageElement<NER, NE>> {
        return Question.about(f`page element located by css (${selector}) containing text ${ text }`, async actor => {
            const cssSelector = await actor.answer(selector);
            const desiredText = await actor.answer(text);

            return BrowseTheWeb.as(actor).findByCssContainingText(cssSelector, desiredText);
        });
    }

    static locatedById<NER, NE>(selector: Answerable<string>): Question<Promise<PageElement<NER, NE>>> & Adapter<PageElement<NER, NE>> {
        return Question.about(f`page element located by id (${selector})`, async actor => {
            const idSelector = await actor.answer(selector);

            return BrowseTheWeb.as(actor).findById(idSelector);
        });
    }

    static locatedByTagName<NER, NE>(tagName: Answerable<string>): Question<Promise<PageElement<NER, NE>>> & Adapter<PageElement<NER, NE>> {
        return Question.about(f`page element located by tag name (${tagName})`, async actor => {
            const tagNameSelector = await actor.answer(tagName);

            return BrowseTheWeb.as(actor).findByTagName(tagNameSelector);
        });
    }

    static locatedByXPath<NER, NE>(selector: Answerable<string>): Question<Promise<PageElement<NER, NE>>> & Adapter<PageElement<NER, NE>> {
        return Question.about(f`page element located by xpath (${selector})`, async actor => {
            const xpathSelector = await actor.answer(selector);

            return BrowseTheWeb.as(actor).findByXPath(xpathSelector);
        });
    }

    constructor(
        protected readonly context: () => Promise<Native_Element_Root_Type> | Native_Element_Root_Type,
        protected readonly locator: (root: Native_Element_Root_Type) => Promise<Native_Element_Type> | Native_Element_Type
    ) {
    }

    abstract of(parent: PageElement<Native_Element_Root_Type, Native_Element_Type>): PageElement<Native_Element_Root_Type, Native_Element_Type>;

    async nativeElement(): Promise<Native_Element_Type> {
        try {
            const context = await this.context();
            return this.locator(context);
        }
        catch (error) {
            throw new LogicError(`Couldn't find element`, error);
        }
    }

    abstract enterValue(value: string | number | Array<string | number>): Promise<void>;
    abstract clearValue(): Promise<void>;
    abstract click(): Promise<void>;
    abstract doubleClick(): Promise<void>;
    abstract scrollIntoView(): Promise<void>;
    abstract hoverOver(): Promise<void>;
    abstract rightClick(): Promise<void>;    // todo: should this be a click() call with a parameter?

    abstract attribute(name: string): Promise<string>;
    abstract text(): Promise<string>;
    abstract value(): Promise<string>;

    abstract isActive(): Promise<boolean>;
    abstract isClickable(): Promise<boolean>;
    abstract isDisplayed(): Promise<boolean>;
    abstract isEnabled(): Promise<boolean>;
    abstract isPresent(): Promise<boolean>;
    abstract isSelected(): Promise<boolean>;
}
