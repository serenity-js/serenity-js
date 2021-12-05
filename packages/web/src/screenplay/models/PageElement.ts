import { Adapter, Answerable, LogicError, Question } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { BrowseTheWeb } from '../abilities';

export abstract class PageElement<NativeElementContext = any, NativeElement = any> {
    static of(childElement: Answerable<PageElement>, parentElement: Answerable<PageElement>): Question<Promise<PageElement>> & Adapter<PageElement> {
        return Question.about<Promise<PageElement>>(formatted `${ childElement } of ${ parentElement })`, async actor => {
            const child     = await actor.answer(childElement);
            const parent    = await actor.answer(parentElement);

            return child.of(parent);
        });
    }

    static locatedByCss(selector: Answerable<string>): Question<Promise<PageElement>> & Adapter<PageElement> {
        return Question.about<Promise<PageElement>>(formatted `page element located by css (${selector})`, async actor => {
            const cssSelector = await actor.answer(selector);

            return BrowseTheWeb.as(actor).findByCss(cssSelector);
        });
    }

    static locatedByCssContainingText(selector: Answerable<string>, text: Answerable<string>): Question<Promise<PageElement>> & Adapter<PageElement> {
        return Question.about<Promise<PageElement>>(formatted `page element located by css (${selector}) containing text ${ text }`, async actor => {
            const cssSelector = await actor.answer(selector);
            const desiredText = await actor.answer(text);

            return BrowseTheWeb.as(actor).findByCssContainingText(cssSelector, desiredText);
        });
    }

    static locatedById(selector: Answerable<string>): Question<Promise<PageElement>> & Adapter<PageElement> {
        return Question.about<Promise<PageElement>>(formatted `page element located by id (${selector})`, async actor => {
            const idSelector = await actor.answer(selector);

            return BrowseTheWeb.as(actor).findById(idSelector);
        });
    }

    static locatedByTagName(selector: Answerable<string>): Question<Promise<PageElement>> & Adapter<PageElement> {
        return Question.about<Promise<PageElement>>(formatted `page element located by tag name (${selector})`, async actor => {
            const tagNameSelector = await actor.answer(selector);

            return BrowseTheWeb.as(actor).findByTagName(tagNameSelector);
        });
    }

    static locatedByXPath(selector: Answerable<string>): Question<Promise<PageElement>> & Adapter<PageElement> {
        return Question.about<Promise<PageElement>>(formatted `page element located by xpath (${selector})`, async actor => {
            const xpathSelector = await actor.answer(selector);

            return BrowseTheWeb.as(actor).findByXPath(xpathSelector);
        });
    }

    constructor(
        protected readonly context: () => Promise<NativeElementContext> | NativeElementContext,
        protected readonly locator: (root: NativeElementContext) => Promise<NativeElement> | NativeElement
    ) {
    }

    abstract of(parent: PageElement): PageElement;

    async nativeElement(): Promise<NativeElement> {
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
