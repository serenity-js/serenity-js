import { Answerable, d, MetaQuestion, Optional, Question, QuestionAdapter } from '@serenity-js/core';
import { ensure, isDefined } from 'tiny-types';

import { BrowseTheWeb } from '../abilities';
import { Locator } from './Locator';
import { SelectOption } from './SelectOption';
import { Selector } from './selectors';
import { Switchable } from './Switchable';
import { SwitchableOrigin } from './SwitchableOrigin';

/**
 * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to identify
 * a single Web element located by {@apilink Selector}.
 *
 * ## Learn more
 * - [Page Element Query Language](/handbook/web-testing/page-element-query-language)
 * - {@apilink Optional}
 * - {@apilink Switchable}
 *
 * @group Models
 */
export abstract class PageElement<Native_Element_Type = any> implements Optional, Switchable {

    static located<NET>(selector: Answerable<Selector>): QuestionAdapter<PageElement<NET>> & MetaQuestion<PageElement, PageElement> {
        return Question.about(d`page element located ${ selector }`, async actor => {
            const bySelector  = await actor.answer(selector);
            const currentPage = await BrowseTheWeb.as<BrowseTheWeb<NET>>(actor).currentPage();

            return currentPage.locate(bySelector);
        }) as QuestionAdapter<PageElement<NET>> & MetaQuestion<PageElement, PageElement>;
    }

    static of<NET>(childElement: Answerable<PageElement<NET>>, parentElement: Answerable<PageElement<NET>>): QuestionAdapter<PageElement<NET>> & MetaQuestion<PageElement, PageElement> {
        return Question.about(d`${ childElement } of ${ parentElement }`, async actor => {
            const child     = await actor.answer(childElement);
            const parent    = await actor.answer(parentElement);

            return child.of(parent);
        }) as QuestionAdapter<PageElement<NET>> & MetaQuestion<PageElement, PageElement>;
    }

    constructor(public readonly locator: Locator<Native_Element_Type>) {
        ensure('native element locator', locator, isDefined());
    }

    abstract of(parentElement: PageElement<Native_Element_Type>): PageElement<Native_Element_Type>;

    /**
     * An "escape hatch" providing access to the integration tool-specific implementation of a Web element.
     */
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
    abstract rightClick(): Promise<void>;
    abstract selectOptions(...options: Array<SelectOption>): Promise<void>;
    abstract selectedOptions(): Promise<Array<SelectOption>>;

    abstract attribute(name: string): Promise<string>;
    abstract text(): Promise<string>;
    abstract value(): Promise<string>;

    /**
     * When the element represents an [`iframe`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe),
     * calling this method switches the current browsing context to the given `iframe` context.
     *
     * When used with other types of [Web `Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element),
     * calling this method will have the same result as calling [`Element.focus()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/focus_event).
     *
     * @returns
     *  Returns an object that allows the caller to switch back
     *  to the previous context if needed.
     *
     * #### Learn more
     * - {@apilink Switch}
     * - {@apilink Switchable}
     */
    abstract switchTo(): Promise<SwitchableOrigin>;

    /**
     * Resolves to `true` when the underlying element [has focus](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus).
     * Otherwise, resolves to `false`.
     */
    abstract isActive(): Promise<boolean>;

    /**
     * Resolves to `true` when the underlying element can be clicked on.
     * Otherwise, resolves to `false`.
     *
     * Please refer to test integration tool-specific documentation for details.
     */
    abstract isClickable(): Promise<boolean>;

    /**
     * Resolves to `true` when the underlying
     * element is not [explicitly disabled](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled)
     *
     * Please refer to test integration tool-specific documentation for details.
     */
    abstract isEnabled(): Promise<boolean>;

    /**
     * Returns a {@apilink Promise} that resolves to `true` when the element
     * is present in the [Document Object Model (DOM)](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model),
     * `false` otherwise.
     */
    async isPresent(): Promise<boolean> {
        return this.locator.isPresent();
    }

    /**
     * Resolves to `true` when the underlying element:
     * - has a [`selected` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#attr-selected) for `<option />` elements
     * - has a [`checked`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox) attribute for checkboxes
     *
     * Otherwise, resolves to `false`.
     */
    abstract isSelected(): Promise<boolean>;

    /**
     * Resolves to `true` when the underlying element:
     * - is not hidden, so doesn't have CSS style like `display: none`, `visibility: hidden` or `opacity: 0`
     * - is within the browser viewport
     * - doesn't have its centre covered by other elements
     *
     * Otherwise, resolves to `false`.
     */
    abstract isVisible(): Promise<boolean>;
}
