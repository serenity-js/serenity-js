import type { Answerable, AnswersQuestions, ChainableMetaQuestion, Expectation, Interaction, MetaQuestion, MetaQuestionAdapter, Optional, QuestionAdapter, QuestionAdapterFieldDecorator, UsesAbilities } from '@serenity-js/core';
import { d, ListItemNotFoundError, MetaList, Question, the } from '@serenity-js/core';
import { ensure, isDefined } from 'tiny-types';

import { BrowseTheWeb } from '../abilities/index.js';
import type { Locator } from './Locator.js';
import type { SelectOption } from './SelectOption.js';
import type { Selector } from './selectors/index.js';
import type { Switchable } from './Switchable.js';
import type { SwitchableOrigin } from './SwitchableOrigin.js';

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

    /**
     * Locates a single Web element by {@link Selector}.
     *
     * The returned adapter supports fluent child element access:
     * - `.element(selector)` — locates a single child element within this element
     * - `.elements(selector)` — locates all matching children, returning a
     *   {@link PageElementList} with full PEQL support (`.where()`, `.first()`,
     *   `.count()`, `.eachMappedTo()`, etc.)
     * - `.of(parent)` — rescopes this element within a different parent
     *
     * #### Example
     *
     * ```ts
     * import { By, PageElement, Text } from '@serenity-js/web'
     * import { Ensure, equals, includes } from '@serenity-js/assertions'
     *
     * const todoList = PageElement.located(By.css('.todo-list'))
     *   .describedAs('todo list')
     *
     * await actor.attemptsTo(
     *   Ensure.that(
     *     todoList.elements(By.css('.item'))
     *       .where(Text, includes('cheese'))
     *       .count(),
     *     equals(1),
     *   ),
     * )
     * ```
     *
     * @param selector
     *
     * @group Models
     */
    static located<NET>(selector: Answerable<Selector>): PageElementAdapter<NET> {
        return Question.about(the`page element located ${ selector }`,
            async actor => {
                const bySelector = await actor.answer(selector);
                const currentPage = await BrowseTheWeb.as<BrowseTheWeb<NET>>(actor).currentPage();
                return currentPage.locate(bySelector);
            },
            pageElementExtensions<NET>(selector),
        ) as unknown as PageElementAdapter<NET>;
    }

    /**
     * Wraps any {@link Answerable}<{@link PageElement}> in a {@link PageElementAdapter},
     * providing `.element()` and `.elements()` for scoped child element lookups.
     *
     * Used by interaction objects to ensure the root element supports
     * fluent child element access regardless of how it was constructed.
     *
     * @param element
     */
    static createAdapter<NET>(element: Answerable<PageElement<NET>>): PageElementAdapter<NET> {
        return Question.about(`${ element }`,
            async actor => actor.answer(element),
            pageElementExtensions<NET>(),
        ) as unknown as PageElementAdapter<NET>;
    }

    static of<NET>(
        childElement: Answerable<PageElement<NET>>,
        parentElement: Answerable<PageElement<NET>>
    ): MetaQuestionAdapter<PageElement<NET>, PageElement<NET>> {
        return Question.about(the`${ childElement } of ${ parentElement }`,
            async actor => {
                const parent = await actor.answer(parentElement);
                const child = (childElement as any).of
                    ? (childElement as any).of(parent)
                    : childElement;

                return actor.answer(child) as Promise<PageElement<NET>>;
            },
            (context: Answerable<PageElement<NET>>) =>
                PageElement.of(childElement, context),
        );
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
     * Locates a single descendant element matching the given selector,
     * scoped within this element.
     *
     * @param selector
     *  The selector to locate the child element
     */
    abstract element(selector: Selector): PageElement<Native_Element_Type>;

    /**
     * Locates all descendant elements matching the given selector,
     * scoped within this element.
     *
     * @param selector
     *  The selector to locate the child elements
     */
    abstract elements(selector: Selector): Promise<Array<PageElement<Native_Element_Type>>>;

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

    /**
     * Drags this element and drops it on the `destination` element.
     *
     * @param destination
     *  The element to drop this element on
     */
    abstract dragTo(destination: PageElement<Native_Element_Type>): Promise<void>;

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

/**
 * The return type of {@link PageElement.located} and related fluent chaining methods.
 *
 * Equivalent to {@link QuestionAdapter}<{@link PageElement}> but with correct return types
 * for `.of()`, `.element()`, and `.elements()`:
 *
 * - `.of(parent)` returns `PageElementAdapter` (not plain `QuestionAdapter<PageElement>`)
 * - `.element(selector)` returns `PageElementAdapter` (not `QuestionAdapter<PageElement>`)
 * - `.elements(selector)` returns {@link PageElementList} with full PEQL support
 *   (`.where()`, `.first()`, `.count()`, `.eachMappedTo()`, etc.)
 *
 * @group Models
 */
export type PageElementAdapter<NET> =
    & Question<Promise<PageElement<NET>>>
    & Interaction
    & { isPresent(): Question<Promise<boolean>> }
    & Omit<QuestionAdapterFieldDecorator<PageElement<NET>>, 'of' | 'element' | 'elements'>
    & {
        of(parent: Answerable<PageElement<NET>>): PageElementAdapter<NET>;
        element(selector: Answerable<Selector>): PageElementAdapter<NET>;
        elements(selector: Answerable<Selector>): PageElementList<NET>;
    };

/**
 * Creates the extensions bag for {@link PageElement.located} and {@link PageElement.createAdapter}.
 *
 * The `.of()` extension rescopes the element within a parent.
 * The `.element()` extension locates a single child element (returns a {@link PageElementAdapter}).
 * The `.elements()` extension locates multiple children (returns a {@link PageElementList}).
 *
 * Extensions auto-propagate through `.of()` — a rescoped element retains
 * `.element()` and `.elements()`.
 *
 * @param selector - When provided, `.of()` uses it to locate the element within the parent.
 *                   When omitted (e.g. for {@link PageElement.createAdapter}), `.of()` is not available.
 * @package
 */
function pageElementExtensions<NET>(selector?: Answerable<Selector>): Record<string, (...args: any[]) => any> {
    const extensions: Record<string, (...args: any[]) => any> = {
        element(this: Question<Promise<PageElement<NET>>>, childSelector: Answerable<Selector>) {
            const parent = this;
            return Question.about(the`${ parent }.element(${ childSelector })`,
                async actor => {
                    const parentElement = await actor.answer(parent);
                    const resolved = await actor.answer(childSelector);
                    return parentElement.element(resolved);
                },
                pageElementExtensions<NET>(),
            ) as unknown as PageElementAdapter<NET>;
        },

        elements(this: Question<Promise<PageElement<NET>>>, childSelector: Answerable<Selector>) {
            const parent = this;
            return new PageElementList<NET>(
                new PageElementsLocator<NET>(parent, childSelector),
            );
        },
    };

    if (selector !== undefined) {
        extensions.of = (parent: Answerable<PageElement<NET>>) =>
            Question.about(the`page element located ${ selector } of ${ parent }`,
                async actor => {
                    const bySelector = await actor.answer(selector);
                    const parentElement = await actor.answer(parent);
                    return parentElement.element(bySelector);
                },
            );
    }

    return extensions;
}

/**
 * A {@link MetaList} of {@link PageElement PageElements} whose `.first()`,
 * `.last()`, and `.nth()` return {@link PageElementAdapter} instead of
 * plain `MetaQuestionAdapter`, preserving `.element()` and `.elements()`
 * for continued fluent chaining.
 *
 * @group Models
 */
export class PageElementList<Native_Element_Type = any>
    extends MetaList<PageElement<Native_Element_Type>, PageElement<Native_Element_Type>>
{
    override of(context: Answerable<PageElement<Native_Element_Type>>): PageElementList<Native_Element_Type> {
        return new PageElementList<Native_Element_Type>(
            this.collection.of(context),
        ).describedAs(this.toString() + d` of ${ context }`) as PageElementList<Native_Element_Type>;
    }

    override where(expectation: Expectation<PageElement<Native_Element_Type>>): PageElementList<Native_Element_Type>;
    override where<Answer_Type>(question: MetaQuestion<PageElement<Native_Element_Type>, Question<Promise<Answer_Type> | Answer_Type>>, expectation: Expectation<Answer_Type>): PageElementList<Native_Element_Type>;
    override where(...args: unknown[]): PageElementList<Native_Element_Type> {
        const baseResult = args.length === 1
            ? super.where(args[0] as Expectation<PageElement<Native_Element_Type>>)
            : super.where(args[0] as any, args[1] as any);
        // super.where() returns new MetaList with the filtered collection.
        // Re-wrap in PageElementList to preserve first()/last()/nth() overrides.
        // TypeScript doesn't allow protected member access on a base-class instance
        // returned from a method, so we use 'as any' to reach the collection.
        return new PageElementList<Native_Element_Type>(
            (baseResult as any).collection,
        ).describedAs(baseResult.toString()) as PageElementList<Native_Element_Type>;
    }

    override first(): PageElementAdapter<Native_Element_Type> & MetaQuestionAdapter<PageElement<Native_Element_Type>, PageElement<Native_Element_Type>> {
        const list = this;
        return Question.about(
            `the first of ${ this.toString() }`,
            async actor => {
                const items = await list.answeredBy(actor);
                if (items.length === 0) {
                    throw new ListItemNotFoundError(d`Can't retrieve the first item from a list with 0 items: ${ items }`);
                }
                return items[0];
            },
            pageElementExtensions<Native_Element_Type>(),
        ) as unknown as PageElementAdapter<Native_Element_Type> & MetaQuestionAdapter<PageElement<Native_Element_Type>, PageElement<Native_Element_Type>>;
    }

    override last(): PageElementAdapter<Native_Element_Type> & MetaQuestionAdapter<PageElement<Native_Element_Type>, PageElement<Native_Element_Type>> {
        const list = this;
        return Question.about(
            `the last of ${ this.toString() }`,
            async actor => {
                const items = await list.answeredBy(actor);
                if (items.length === 0) {
                    throw new ListItemNotFoundError(d`Can't retrieve the last item from a list with 0 items: ${ items }`);
                }
                return items.at(-1) as PageElement<Native_Element_Type>;
            },
            pageElementExtensions<Native_Element_Type>(),
        ) as unknown as PageElementAdapter<Native_Element_Type> & MetaQuestionAdapter<PageElement<Native_Element_Type>, PageElement<Native_Element_Type>>;
    }

    override nth(index: number): PageElementAdapter<Native_Element_Type> & MetaQuestionAdapter<PageElement<Native_Element_Type>, PageElement<Native_Element_Type>> {
        const list = this;
        return Question.about(
            `the ${ ordinal(index + 1) } of ${ this.toString() }`,
            async actor => {
                const items = await list.answeredBy(actor);
                if (index < 0 || index >= items.length) {
                    throw new ListItemNotFoundError(
                        `Can't retrieve the ${ ordinal(index + 1) } item from a list with ${ items.length } items: ` + d`${ items }`,
                    );
                }
                return items[index];
            },
            pageElementExtensions<Native_Element_Type>(),
        ) as unknown as PageElementAdapter<Native_Element_Type> & MetaQuestionAdapter<PageElement<Native_Element_Type>, PageElement<Native_Element_Type>>;
    }
}

function ordinal(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Locates multiple child elements within a parent element,
 * preserving `.of()` composability.
 *
 * @package
 */
class PageElementsLocator<Native_Element_Type = any>
    extends Question<Promise<Array<PageElement<Native_Element_Type>>>>
    implements ChainableMetaQuestion<PageElement<Native_Element_Type>, Question<Promise<Array<PageElement<Native_Element_Type>>>>>
{
    constructor(
        private readonly parent: Answerable<PageElement<Native_Element_Type>>,
        private readonly selector: Answerable<Selector>,
    ) {
        super(the`${ parent }.elements(${ selector })`);
    }

    of(context: Answerable<PageElement<Native_Element_Type>>): PageElementsLocator<Native_Element_Type> {
        return new PageElementsLocator<Native_Element_Type>(
            (this.parent as any).of(context),
            this.selector,
        );
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Array<PageElement<Native_Element_Type>>> {
        const parentElement = await actor.answer(this.parent);
        const selector = await actor.answer(this.selector);
        return parentElement.elements(selector);
    }
}
