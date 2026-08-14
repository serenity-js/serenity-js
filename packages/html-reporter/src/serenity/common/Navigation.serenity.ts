import { equals, includes, not } from '@serenity-js/assertions';
import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Check, notes, Task, the, Wait } from '@serenity-js/core';
import { Attribute, By, Click, isVisible, Page, PageElement, PageElements, Text } from '@serenity-js/web';

/**
 * Interaction object for navigating between views via the sidebar.
 *
 * Unlike most interaction objects in the HTML reporter, `Navigation` does **not**
 * extend {@link InteractionObject} — it operates on global page elements (the sidebar,
 * hamburger menu, theme toggle) rather than a scoped root element.
 *
 * Handles responsive navigation transparently: on mobile viewports where the sidebar
 * is hidden behind a hamburger menu, `openView()` and `selectTheme()` open the menu
 * first before interacting with navigation items.
 *
 * ## Instantiation
 *
 * ```ts
 * import { Navigation } from '@serenity-js/html-reporter/serenity';
 *
 * const navigation = new Navigation();
 * ```
 *
 * ## Usage in a test
 *
 * ```ts
 * await actor.attemptsTo(
 *   navigation.openView('Test Scenarios'),
 *   Ensure.that(scenariosView.scenarioCount(), isGreaterThan(0)),
 * );
 * ```
 *
 * ## Wiring into view interaction objects
 *
 * Views typically accept a `Navigation` instance and delegate via an `open()` method:
 *
 * ```ts
 * export class ScenariosView<NET> extends InteractionObject<NET> {
 *   constructor(rootElement, private readonly navigation: Navigation) { ... }
 *
 *   open = (): Task =>
 *     Task.where('#actor opens the Scenarios view',
 *       this.navigation.openView('Test Scenarios'),
 *     );
 * }
 * ```
 *
 * @group Interaction Objects
 */
export class Navigation {
    private static routeRegex = /^#\/([^?]+)/;

    private hamburgerMenu = PageElement.located(By.css('.view-topbar button[aria-label="Open menu"]')).describedAs('hamburger menu button');
    private sidebar = PageElement.located(By.css('aside.sidebar'));
    private navItems = PageElements.located(By.css('.nav-item')).of(this.sidebar).describedAs('navigation items');

    private summaryLinkElement = PageElement.located(By.css('link[rel="alternate"][type="application/json"]')).describedAs('summary.json link');

    /**
     * The `href` attribute of the `<link rel="alternate">` element pointing
     * to the machine-readable `summary.json` file.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(navigation.summaryLink(), includes('summary.json')),
     * );
     * ```
     */
    summaryLink = (): QuestionAdapter<string> =>
        Attribute.called('href').of(this.summaryLinkElement).describedAs('summary.json href');

    /**
     * The `title` attribute of the `<link rel="alternate">` element for `summary.json`.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(navigation.summaryLinkTitle(), equals('Test results summary (JSON)')),
     * );
     * ```
     */
    summaryLinkTitle = (): QuestionAdapter<string> =>
        Attribute.called('title').of(this.summaryLinkElement).describedAs('summary.json link title');

    private navItemCalled = (name: Answerable<string>) =>
        this.navItems
            .where(Text, includes(name))
            .first()
            .describedAs(the`${name}`);

    private currentRouteName = () =>
        Page.current()
            .url()
            .hash
            .match(Navigation.routeRegex)?.[1]
            .describedAs('current route name');

    /**
     * Navigates to a view by clicking its sidebar navigation item.
     *
     * On mobile viewports where the sidebar is hidden, this opens the hamburger
     * menu first, then clicks the nav item. Waits until the route has changed
     * before completing.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   navigation.openView('Test Scenarios'),
     *   Ensure.that(scenariosView.scenarioCount(), isGreaterThan(0)),
     * );
     * ```
     *
     * @param viewName
     *  The visible text of the sidebar navigation item (e.g. `'Dashboard'`,
     *  `'Test Scenarios'`, `'Capabilities'`, `'Consistency'`)
     */
    openView = (viewName: Answerable<string>): Task =>
        Task.where(the`#actor opens the ${viewName} view`,
            Check.whether(this.hamburgerMenu, isVisible())
                .andIfSo(Click.on(this.hamburgerMenu)),
            notes().set('previousRouteName', this.currentRouteName()),
            Click.on(this.navItemCalled(viewName)),
            Wait.until(this.currentRouteName(), not(equals(notes().get('previousRouteName')))),
        );

    /**
     * Switches the report's colour theme via the sidebar theme toggle.
     *
     * On mobile viewports where the sidebar is hidden, this opens the hamburger
     * menu first before interacting with the theme switcher.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   navigation.selectTheme('dark'),
     * );
     * ```
     *
     * @param preference
     *  The theme to activate (e.g. `'light'`, `'dark'`, `'system'`)
     */
    selectTheme = (preference: string): Task =>
        Task.where(the`#actor selects the ${preference} theme`,
            Check.whether(this.hamburgerMenu, isVisible())
                .andIfSo(Click.on(this.hamburgerMenu)),
            Click.on(PageElement.located(By.css(`.theme-switch-option[title="${preference} theme"]`)).describedAs(`${preference} theme option`)),
        );
}
