import { Adapter, Answerable, format, LogicError, Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';
import { NativeElementLocator } from './NativeElementLocator';
import { Selector } from './selectors';

const d = format({ markQuestions: false });

export abstract class PageElement<Native_Element_Type = any> {

    static located<NET, SP extends unknown[]>(selector: Answerable<Selector<SP>>): Question<Promise<PageElement<NET>>> & Adapter<PageElement<NET>> {
        return Question.about(d`page element located ${ selector }`, async actor => {
            const bySelector = await actor.answer(selector);
            return BrowseTheWeb.as(actor).locate<SP>(bySelector);
        });
    }

    // --- todo: review
    static of<NET>(childElement: Answerable<PageElement<NET>>, parentElement: Answerable<PageElement<NET>>): Question<Promise<PageElement<NET>>> & Adapter<PageElement<NET>> {
        return Question.about(d`${ childElement } of ${ parentElement })`, async actor => {
            const child     = await actor.answer(childElement);
            const parent    = await actor.answer(parentElement);

            return child.of(parent);
        });
    }

    constructor(
        protected readonly selector: Selector<unknown[]>,
        private readonly locator: NativeElementLocator<Native_Element_Type>,
    ) {
    }

    abstract of(parent: PageElement<Native_Element_Type>): PageElement<Native_Element_Type>;

    async nativeElement(): Promise<Native_Element_Type> {
        try {
            return this.locator.locate(this.selector);
        }
        catch (error) {
            throw new LogicError(`Couldn't find element`, error);
        }
    }

    nativeElementLocator(): NativeElementLocator<Native_Element_Type> {
        return this.locator;
    }

    toString(): string {
        return `PageElement located ${ this.selector }`
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
    abstract isEnabled(): Promise<boolean>;
    abstract isPresent(): Promise<boolean>;
    abstract isSelected(): Promise<boolean>;
    abstract isVisible(): Promise<boolean>;
}
