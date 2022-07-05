import { Answerable, d, Optional, Question, QuestionAdapter } from '@serenity-js/core';
import { ensure, isDefined } from 'tiny-types';

import { BrowseTheWeb } from '../abilities';
import { Locator } from './Locator';
import { SelectOption } from './SelectOption';
import { Selector } from './selectors';
import { Switchable } from './Switchable';
import { SwitchableOrigin } from './SwitchableOrigin';

export abstract class PageElement<Native_Element_Type = any> implements Optional, Switchable {

    static located<NET>(selector: Answerable<Selector>): QuestionAdapter<PageElement<NET>> {
        return Question.about(d`page element located ${ selector }`, async actor => {
            const bySelector  = await actor.answer(selector);
            const currentPage = await BrowseTheWeb.as<NET>(actor).currentPage();

            return currentPage.locate(bySelector);
        });
    }

    static of<NET>(childElement: Answerable<PageElement<NET>>, parentElement: Answerable<PageElement<NET>>): QuestionAdapter<PageElement<NET>> {
        return Question.about(d`${ childElement } of ${ parentElement }`, async actor => {
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
    abstract selectOptions(...options: Array<SelectOption>): Promise<void>;
    abstract selectedOptions(): Promise<Array<SelectOption>>;

    abstract attribute(name: string): Promise<string>;
    abstract text(): Promise<string>;
    abstract value(): Promise<string>;

    /**
     * @desc
     *  When the element represents an {@link iframe}, calling this method
     *  switches the current browsing context to the given {@link iframe}.
     *
     *  In other cases, calling this method will have the same result
     *  as calling {@link HTMLElement#focus}
     *
     * @returns {Promise<SwitchableOrigin>}
     *  Returns an object that allows the caller to switch back
     *  to the previous context if needed.
     *
     * @see {@link Switch}
     * @see {@link Switchable}
     */
    abstract switchTo(): Promise<SwitchableOrigin>;

    abstract isActive(): Promise<boolean>;
    abstract isClickable(): Promise<boolean>;
    abstract isEnabled(): Promise<boolean>;

    /**
     * @desc
     *  Returns an {@link Promise} that resolves to `true` when the element
     *  is present, `false` otherwise.
     *
     * @returns {Promise<boolean>}
     */
    abstract isPresent(): Promise<boolean>;

    abstract isSelected(): Promise<boolean>;

    /**
     * @desc
     *  Checks if the PageElement:
     *  - is not hidden, so doesn't have CSS style like `display: none`, `visibility: hidden` or `opacity: 0`
     *  - is within the browser viewport
     *  - doesn't have its centre covered by other elements
     *
     * @returns {Promise<boolean>}
     */
    abstract isVisible(): Promise<boolean>;
}
