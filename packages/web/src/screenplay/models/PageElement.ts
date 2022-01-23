import { Answerable, d, Optional, Question, QuestionAdapter } from '@serenity-js/core';
import { ensure, isDefined } from 'tiny-types';

import { BrowseTheWeb } from '../abilities';
import { Locator } from './Locator';
import { Selector } from './selectors';

export abstract class PageElement<Native_Element_Type = any> implements Optional {

    static located<NET>(selector: Answerable<Selector>): QuestionAdapter<PageElement<NET>> {
        return Question.about(d`page element located ${ selector }`, async actor => {
            const bySelector = await actor.answer(selector);
            return BrowseTheWeb.as<NET>(actor).locate(bySelector).element();
        });
    }

    // todo: review usages and consider removing if not used
    static of<NET>(childElement: Answerable<PageElement<NET>>, parentElement: Answerable<PageElement<NET>>): QuestionAdapter<PageElement<NET>> {
        return Question.about(d`${ childElement } of ${ parentElement })`, async actor => {
            const child     = await actor.answer(childElement);
            const parent    = await actor.answer(parentElement);

            return child.of(parent);
        });
    }

    constructor(public readonly locator: Locator<Native_Element_Type>) {
        ensure('native element locator', locator, isDefined());
    }

    abstract of(parentElement: PageElement<Native_Element_Type>): PageElement<Native_Element_Type>;

    async nativeElement(): Promise<Native_Element_Type> {
        return this.locator.nativeElement();
    }

    toString(): string {
        return `PageElement located ${ this.locator.toString() }`;
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
