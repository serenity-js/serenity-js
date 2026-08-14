import type { Answerable, Optional, QuestionAdapter } from '@serenity-js/core';
import { PageElement, PageElements, type Selector } from '@serenity-js/web';

/**
 * Options for configuring an {@link InteractionObject}.
 *
 * @group Interaction Objects
 */
export interface InteractionObjectOptions {
    /**
     * When `true`, the interaction object uses mobile-specific locators and interaction flows
     * (e.g., opening a bottom sheet before accessing filters, rather than interacting with
     * an always-visible filter bar).
     *
     * Typically derived from the viewport width in a Playwright Test fixture:
     *
     * ```ts
     * const viewport = page.viewportSize();
     * const options = { mobile: viewport ? viewport.width <= 768 : false };
     * ```
     */
    mobile?: boolean;
}

/**
 * Base class for interaction objects — the Screenplay Pattern equivalent of Page Objects.
 *
 * An interaction object models a UI component from the perspective of its **consumer**:
 * what can a user **observe** about its state (Questions), and what can they **do** with it (Tasks)?
 * Implementation details — CSS selectors, DOM structure, responsive breakpoints — are
 * encapsulated inside the interaction object and never leak into tests.
 *
 * ## Philosophy
 *
 * Interaction objects bridge the gap between the Screenplay Pattern and component testing.
 * Where a traditional Page Object exposes imperative methods that perform actions and return values,
 * an interaction object exposes **declarative** Screenplay building blocks:
 *
 * - **Questions** describe observable state as nouns (`outcome()`, `name()`, `scenarioCount()`)
 * - **Tasks** describe user actions as verbs (`open()`, `find(term)`, `selectFilter(label)`)
 *
 * Because Questions and Tasks are first-class Screenplay citizens, they compose naturally
 * with `Ensure.that()`, `Check.whether()`, `Wait.until()`, and other Serenity/JS interactions.
 * Tests read as specifications of user behaviour, not as scripts that manipulate the DOM.
 *
 * ## Declarative element access
 *
 * Interaction objects use the Page Element Query Language (PEQL) to locate elements
 * **relative to a root element**. The `child()` and `children()` methods scope all lookups
 * within the interaction object's root, preventing selector collisions between components.
 *
 * ```ts
 * // All selectors are scoped to this.rootElement — never global
 * private readonly title = this.child(By.css('.title')).describedAs('widget title');
 * private readonly items = this.children(By.css('.item')).describedAs('list items');
 * ```
 *
 * ## Composition
 *
 * Interaction objects compose into hierarchies that mirror the UI structure:
 *
 * ```
 * View (ScenariosView, DashboardView, ...)
 *   └── composes child interaction objects (FilterBar, SearchInput, ...)
 *         └── each scopes its own locators within the parent's root element
 * ```
 *
 * Child interaction objects are constructed with a scoped root element via `this.child(...)`:
 *
 * ```ts
 * export class ScenariosView<NET> extends InteractionObject<NET> {
 *   readonly filterBar = new FilterBar(this.child(By.css('[data-testid="filter-bar"]')));
 *   readonly searchInput = new SearchInput(this.child(By.css('[data-testid="search-input"]')));
 * }
 * ```
 *
 * ## Presence via Optional
 *
 * Every interaction object implements
 * [`Optional`](https://serenity-js.org/api/core/interface/Optional/),
 * so tests can assert on component presence directly:
 *
 * ```ts
 * await actor.attemptsTo(
 *   Ensure.that(view.filterBar, isPresent()),
 *   Ensure.that(view.searchInput, not(isPresent())),
 * );
 * ```
 *
 * ## Creating a custom interaction object
 *
 * ```ts
 * import { InteractionObject } from '@serenity-js/html-reporter/serenity';
 * import { By, Click, Text } from '@serenity-js/web';
 * import { Task, the } from '@serenity-js/core';
 * import type { QuestionAdapter } from '@serenity-js/core';
 *
 * export class TodoItem<NET> extends InteractionObject<NET> {
 *
 *   // Questions — what the user observes
 *   label = (): QuestionAdapter<string> =>
 *     this.child(By.css('.todo-label')).text().trim()
 *       .describedAs('todo item label');
 *
 *   isCompleted = (): QuestionAdapter<string> =>
 *     Attribute.called('aria-checked').of(this.child(By.css('.checkbox')))
 *       .describedAs('whether todo is completed');
 *
 *   // Tasks — what the user does
 *   toggle = (): Task =>
 *     Task.where('#actor toggles the todo item',
 *       Click.on(this.child(By.css('.checkbox'))),
 *     );
 *
 *   delete = (): Task =>
 *     Task.where('#actor deletes the todo item',
 *       Click.on(this.child(By.css('.delete-button'))),
 *     );
 * }
 * ```
 *
 * ## Wiring into a Playwright Test fixture
 *
 * ```ts
 * import { useFixtures } from '@serenity-js/playwright-test';
 * import { By, PageElement } from '@serenity-js/web';
 *
 * export const { describe, it } = useFixtures<{ todoList: TodoList<unknown> }>({
 *   todoList: async ({ }, use) => {
 *     const rootElement = PageElement.located(By.css('[data-testid="todo-list"]'))
 *       .describedAs('todo list');
 *     await use(new TodoList(rootElement));
 *   },
 * });
 * ```
 *
 * @group Interaction Objects
 */
export class InteractionObject<NET> implements Optional {
    protected readonly mobile: boolean;

    constructor(
        protected readonly rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>,
        options?: InteractionObjectOptions,
    ) {
        this.mobile = options?.mobile ?? false;
    }

    /**
     * Checks whether the interaction object's root element is present in the DOM.
     *
     * Since `InteractionObject` implements
     * [`Optional`](https://serenity-js.org/api/core/interface/Optional/),
     * you can assert on presence directly:
     *
     * ```ts
     * Ensure.that(view, isPresent())
     * ```
     */
    isPresent(): Answerable<boolean> {
        return this.rootElement.isPresent();
    }

    /**
     * Locates a single child element within this interaction object's root.
     *
     * All locators are scoped to `this.rootElement`, so selectors only match
     * elements inside this component — never globally.
     *
     * ## Example
     *
     * ```ts
     * private readonly title = this.child(By.css('.card-title'))
     *   .describedAs('card title');
     *
     * // Use in a Question
     * cardTitle = (): QuestionAdapter<string> =>
     *   this.title.text().trim().describedAs('card title text');
     * ```
     *
     * @param selector
     *  CSS, XPath, or other selector to locate the child element
     */
    protected child(selector: Answerable<Selector>): QuestionAdapter<PageElement> {
        return PageElement
            .located(selector)
            .of(this.rootElement);
    }

    /**
     * Locates multiple child elements within this interaction object's root.
     *
     * Returns a PEQL collection that supports `.where()`, `.eachMappedTo()`,
     * `.first()`, `.last()`, `.count()`, and other collection operations.
     *
     * ## Example
     *
     * ```ts
     * private readonly items = this.children(By.css('.list-item'))
     *   .describedAs('list items');
     *
     * // Count items
     * itemCount = (): Question<Promise<number>> =>
     *   this.items.count().describedAs('number of items');
     *
     * // Extract text from all items
     * itemNames = (): Question<Promise<string[]>> =>
     *   this.items.eachMappedTo(Text).describedAs('item names');
     *
     * // Filter then access
     * itemCalled = (name: string) =>
     *   this.items.where(Text, includes(name)).first();
     * ```
     *
     * @param selector
     *  CSS, XPath, or other selector to locate the child elements
     */
    protected children(selector: Answerable<Selector>): ReturnType<typeof PageElements.located> {
        return PageElements
            .located(selector)
            .of(this.rootElement);
    }
}
