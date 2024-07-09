import type { Answerable, MetaQuestion, MetaQuestionAdapter, Optional , QuestionAdapter} from '@serenity-js/core';
import { Question, the } from '@serenity-js/core';
import { ensure, isDefined } from 'tiny-types';

import { BrowseTheWeb } from '../abilities';
import type { Locator } from './Locator';
import type { SelectOption } from './SelectOption';
import type { Selector } from './selectors';
import type { Switchable } from './Switchable';
import type { SwitchableOrigin } from './SwitchableOrigin';

/**
 * Uses the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to identify
 * a single Web element located by [`Selector`](https://serenity-js.org/api/web/class/Selector/).
 *
 * ## Learn more
 * - [Page Element Query Language](https://serenity-js.org/handbook/web-testing/page-element-query-language)
 * - [`Optional`](https://serenity-js.org/api/core/interface/Optional/)
 * - [`Switchable`](https://serenity-js.org/api/web/interface/Switchable/)
 *
 * @group Models
 */
export abstract class PageElement<Native_Element_Type = any> implements Optional, Switchable {

    static from<NET>(nativeElement: NET): MetaQuestionAdapter<PageElement<NET>, PageElement<NET>> {
        return Question.about(`native page element`, async actor => {
            const currentPage = await BrowseTheWeb.as<BrowseTheWeb<NET>>(actor).currentPage();

            return currentPage.createPageElement(nativeElement);
        });
    }

    static located<NET>(selector: Answerable<Selector>): MetaQuestionAdapter<PageElement<NET>, PageElement<NET>> {
        return Question.about(the`page element located ${ selector }`, async actor => {
            const bySelector  = await actor.answer(selector);
            const currentPage = await BrowseTheWeb.as<BrowseTheWeb<NET>>(actor).currentPage();

            return currentPage.locate(bySelector);
        });
    }

    static of<NET>(
        childElement: MetaQuestionAdapter<PageElement<NET>, PageElement<NET>> | PageElement<NET>,
        parentElement: Answerable<PageElement<NET>>
    ): MetaQuestionAdapter<PageElement<NET>, PageElement<NET>> {
        return Question.about(the`${ childElement } of ${ parentElement }`, async actor => {
            const parent = await actor.answer(parentElement);
            const child = childElement.of(parent)

            return actor.answer(child);
        });
    }

    /**
     * A static method producing a [`MetaQuestion`](https://serenity-js.org/api/core/interface/MetaQuestion/) that can be used with [`PageElements.eachMappedTo`](https://serenity-js.org/api/web/class/PageElements/#eachMappedTo) method
     * to extract the HTML of each element in a collection.
     *
     * #### Example
     *
     * ```typescript
     * import { actorCalled, Log } from '@serenity-js/core'
     * import { Navigate, PageElement, By, Text } from '@serenity-js/web'
     * import { includes } from '@serenity-js/assertions'
     *
     * await actorCalled('Debbie').attemptsTo(
     *   Navigate.to('https://serenity-js.org'),
     *
     *   Log.the(
     *     PageElements.located(By.css('a'))
     *       .where(Text, includes('modular'))
     *       .eachMappedTo(PageElement.html())
     *   ),
     * )
     * ```
     */
    static html<NET>(): MetaQuestion<PageElement<NET>, QuestionAdapter<string>> {
        return {
            of: (pageElement: Answerable<PageElement<NET>>) =>
                Question.about(`outer HTML of ${pageElement}`, async actor => {
                    const element = await actor.answer(pageElement);
                    return element.html();
                })
        }
    }

    constructor(public readonly locator: Locator<Native_Element_Type>) {
        ensure('native element locator', locator, isDefined());
    }

    /**
     * Locates a child element that:
     * - matches the given selector
     * - is located within the `parentElement`
     *
     * @param parentElement
     */
    abstract of(parentElement: PageElement<Native_Element_Type>): PageElement<Native_Element_Type>;

    /**
     * Traverses the element and its parents, heading toward the document root,
     * until it finds a parent [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) that matches its associated CSS selector.
     *
     * #### Example
     *
     * ```html
     * <div class="form-entry">
     *     <input id="username" />
     *     <ul class="warnings">
     *         <li>Username should be an email address</li>
     *     </ul>
     * </div>
     * ```
     *
     * ```typescript
     * class Username {
     *   static field = () =>
     *     PageElement.located(By.id('username'))
     *       .describedAs('username field')
     *
     *   private static container = () =>
     *     PageElement.located(By.css('.form-entry'))
     *       .describedAs('form entry container')
     *
     *   static warnings = () =>
     *     PageElements.located(By.css('ul.warnings li'))
     *       .describedAs('warnings')
     *       .of(
     *         Username.container().closestTo(Username.field())
     *       )
     * }
     * ```
     *
     * :::info
     * This method relies on [Element: closest() API](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest),
     * and so is only compatible with locating parent elements specified using the following CSS selectors:
     * - [`ByCss`](https://serenity-js.org/api/web/class/ByCss/)
     * - [`ById`](https://serenity-js.org/api/web/class/ById/)
     * - [`ByTagName`](https://serenity-js.org/api/web/class/ByTagName/)
     * :::
     *
     * @param childElement
     * @returns
     *
     * #### Learn more
     * - [Element: closest() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)
     */
    abstract closestTo(childElement: PageElement<Native_Element_Type>): PageElement<Native_Element_Type>;

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
     * An instance method that resolves to the value of the [`outerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML) property
     * of the underlying element.
     *
     * #### Example
     *
     * ```typescript
     * import { actorCalled, Log } from '@serenity-js/core'
     * import { Navigate, PageElement, By } from '@serenity-js/web'
     *
     * await actorCalled('Debbie').attemptsTo(
     *   Navigate.to('https://serenity-js.org'),
     *
     *   Log.the(
     *     PageElement.located(By.css('h1')).html()
     *   ),
     * )
     * ```
     */
    abstract html(): Promise<string>;

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
     * - [`Switch`](https://serenity-js.org/api/web/class/Switch/)
     * - [`Switchable`](https://serenity-js.org/api/web/interface/Switchable/)
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
     * Returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to `true` when the element
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
