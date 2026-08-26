import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Check, Task, the } from '@serenity-js/core';
import { By, Click, isVisible, PageElement, Text } from '@serenity-js/web';

import type { InteractionObjectOptions } from '../common/InteractionObject.serenity.js';
import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { KpiCard } from '../common/KpiCard.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ResultCount } from '../common/ResultCount.serenity.js';
import { SearchInput } from '../common/SearchInput.serenity.js';
import { ScenarioItem } from '../scenarios/ScenarioItem.serenity.js';

/**
 * Interaction object representing the **Errors** view in the HTML report.
 *
 * Groups test failures by root cause (error fingerprint), making it easy to identify
 * the most common failure modes. Shows KPI cards summarising error categories,
 * searchable error groups, and individual affected scenarios within each group.
 *
 * Composes child interaction objects ({@link SearchInput}, {@link ResultCount}, {@link KpiCard})
 * that handle individual UI widgets.
 *
 * On mobile viewports, search controls live inside a bottom sheet. The same `find()` method
 * works regardless of viewport size when the `{ mobile: true }` option is set.
 *
 * ## Instantiation
 *
 * ```ts
 * import { ErrorsView, Navigation } from '@serenity-js/html-reporter/serenity';
 * import { By, PageElement } from '@serenity-js/web';
 *
 * const errorsView = new ErrorsView(
 *   PageElement.located(By.css('[data-testid="errors"]')).describedAs('errors view'),
 *   new Navigation(),
 * );
 * ```
 *
 * ## Usage in an integration test
 *
 * ```ts
 * await actor.attemptsTo(
 *   errorsView.open(),
 *   Ensure.that(errorsView.errorGroupCount(), isGreaterThan(0)),
 *   errorsView.find('timeout'),
 *   errorsView.clickErrorGroupContaining('TimeoutError'),
 *   Ensure.that(errorsView.scenarioNames(), contain('Login should handle timeout')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class ErrorsView<NET> extends InteractionObject<NET> {

    private static readonly scenarioNameSelector = By.css('.scenario-name');

    // Structure — child interaction objects
    readonly searchInput = new SearchInput<NET>(this.child(By.css('[data-testid="search-input"]')));
    readonly resultCount = new ResultCount<NET>(this.child(By.css('[data-testid="result-count"]')));

    // Structure — mobile child interaction objects
    private readonly mobileSearchInput = new SearchInput<NET>(
        this.child(By.css('[data-testid="bottom-sheet"] [data-testid="search-input"]'))
    );

    // Structure — page elements
    private readonly kpiCards = this.children(By.css('[data-testid="kpi-card"]')).describedAs('errors KPI cards');
    private readonly mobileKpiCards = this.children(By.css('[data-testid="bottom-sheet"] [data-testid="kpi-card"]')).describedAs('mobile errors KPI cards');
    private readonly scenarioItems = this.children(By.css('.scenario-item')).describedAs('errors scenario items');
    private readonly scenarioNameElements = this.children(ErrorsView.scenarioNameSelector).describedAs('errors scenario names');

    private filterSheetTrigger = () =>
        this.child(By.css('[aria-label="Search and filter"]'))
            .describedAs('filter sheet trigger');

    private statsSheetTrigger = () =>
        this.child(By.css('[aria-label="Error statistics"]'))
            .describedAs('stats sheet trigger');

    private bottomSheetClose = () =>
        this.child(By.css('[data-testid="bottom-sheet"] .bottom-sheet-close'))
            .describedAs('bottom sheet close button');

    private openFilterSheet = (): Task =>
        Task.where('#actor opens the filter sheet',
            Click.on(this.filterSheetTrigger()),
        );

    private closeFilterSheet = (): Task =>
        Task.where('#actor closes the filter sheet',
            Click.on(this.bottomSheetClose()),
        );

    /**
     * Opens the error statistics bottom sheet (mobile viewport).
     *
     * Only triggers if the stats sheet trigger button is visible.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   errorsView.openStatsSheet(),
     *   Ensure.that(errorsView.kpiCardCalled('Unique Errors').value(), equals('3')),
     * );
     * ```
     */
    openStatsSheet = (): Task =>
        Task.where('#actor opens the error stats sheet',
            Check.whether(this.statsSheetTrigger(), isVisible())
                .andIfSo(Click.on(this.statsSheetTrigger())),
        );

    /**
     * Closes the error statistics bottom sheet (mobile viewport).
     *
     * Only triggers if the close button is visible.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   errorsView.closeStatsSheet(),
     * );
     * ```
     */
    closeStatsSheet = (): Task =>
        Task.where('#actor closes the error stats sheet',
            Check.whether(this.bottomSheetClose(), isVisible())
                .andIfSo(Click.on(this.bottomSheetClose())),
        );

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation(), options?: InteractionObjectOptions) {
        super(rootElement, options);
    }

    // Behaviour — questions

    /**
     * Returns the {@link KpiCard} at the given zero-based index in the errors summary.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(errorsView.kpiCardAt(0).value(), equals('5'))
     * ```
     *
     * @param index
     *  Zero-based position of the KPI card
     */
    kpiCardAt = (index: number): KpiCard<NET> =>
        new KpiCard(this.kpiCards.nth(index));

    /**
     * Locates a {@link KpiCard} by its label text in the error statistics panel.
     *
     * On mobile viewports, locates the card inside the stats bottom sheet.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   Ensure.that(errorsView.kpiCardCalled('Unique Errors').value(), equals('3')),
     * );
     * ```
     *
     * @param label
     *  Substring to match against KPI card labels (case-insensitive)
     */
    kpiCardCalled = (label: string): KpiCard<NET> => {
        const cards = this.mobile ? this.mobileKpiCards : this.kpiCards;
        const cardElement = cards
            .where(Text.of(PageElement.located(By.css('.kpi-label'))), includes(label.toUpperCase()))
            .first()
            .describedAs(`KPI card called "${label}"`);
        return new KpiCard(cardElement);
    };

    /**
     * Locates a scenario by name within the error group list and returns a
     * {@link ScenarioItem} interaction object for inspecting its state.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(errorsView.scenarioCalled('Login timeout').outcome(), equals('FAILURE'))
     * ```
     *
     * @param name
     *  Substring to match against scenario names
     */
    scenarioCalled = (name: string): ScenarioItem<NET> => {
        const matchingItem = this.scenarioItems
            .where(Text.of(PageElement.located(ErrorsView.scenarioNameSelector)), includes(name))
            .first()
            .describedAs(`errors scenario called "${name}"`);
        return new ScenarioItem(matchingItem);
    };

    /**
     * The full rendered text of the error group row containing the given scenario name.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(errorsView.errorGroupTextFor('timeout'), includes('TimeoutError'))
     * ```
     *
     * @param name
     *  Substring to match against scenario names within error groups
     */
    errorGroupTextFor = (name: string): QuestionAdapter<string> =>
        this.scenarioItems
            .where(Text.of(PageElement.located(ErrorsView.scenarioNameSelector)), includes(name))
            .first()
            .text()
            .describedAs(`error group text for "${name}"`);

    /**
     * The display names of all scenarios currently visible in the errors list.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(errorsView.scenarioNames(), contain('Login should handle timeout'))
     * ```
     */
    scenarioNames = (): Question<Promise<string[]>> =>
        this.scenarioNameElements
            .eachMappedTo(Text)
            .describedAs('errors scenario names');

    /**
     * The full body text of the errors view.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(errorsView.bodyText(), includes('No errors'))
     * ```
     */
    bodyText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).describedAs('errors view body text');

    /**
     * The number of error groups currently displayed.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(errorsView.errorGroupCount(), equals(3))
     * ```
     */
    errorGroupCount = (): QuestionAdapter<number> =>
        this.scenarioItems.count()
            .describedAs('error group count');

    // Behaviour — tasks

    /**
     * Searches for error groups by entering text into the search input.
     *
     * On mobile viewports, opens the bottom sheet to access the search input.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   errorsView.find('timeout'),
     *   Ensure.that(errorsView.errorGroupCount(), equals(1)),
     * );
     * ```
     *
     * @param searchTerm
     *  Text to search for (matches error messages and scenario names)
     */
    find = (searchTerm: Answerable<string>): Task =>
        this.mobile
            ? Task.where(the`#actor searches for ${searchTerm}`,
                this.openFilterSheet(),
                this.mobileSearchInput.searchFor(searchTerm),
                this.closeFilterSheet(),
            )
            : Task.where(the`#actor searches for ${searchTerm}`,
                this.searchInput.searchFor(searchTerm),
            );

    /**
     * The displayed result count text (e.g. `'3 of 5 error groups'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(errorsView.resultCountText(), includes('3 of 5'))
     * ```
     */
    resultCountText = (): QuestionAdapter<string> =>
        this.resultCount.text();

    /**
     * Clicks the first error group in the list to expand it or navigate to its details.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   errorsView.clickFirstErrorGroup(),
     * );
     * ```
     */
    clickFirstErrorGroup = (): Task =>
        Task.where('#actor clicks the first error group',
            Click.on(
                this.scenarioItems.first()
                    .describedAs('first error group'),
            ),
        );

    /**
     * Clicks the error group whose text contains the given substring.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   errorsView.clickErrorGroupContaining('TimeoutError'),
     * );
     * ```
     *
     * @param text
     *  Substring to match within the error group's rendered text
     */
    clickErrorGroupContaining = (text: Answerable<string>): Task =>
        Task.where(the`#actor clicks the error group containing ${ text }`,
            Click.on(
                this.scenarioItems
                    .where(Text, includes(text))
                    .first()
                    .describedAs(the`error group containing ${ text }`),
            ),
        );

    /**
     * Navigates to the Errors view via the sidebar navigation.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   errorsView.open(),
     *   Ensure.that(errorsView.errorGroupCount(), isGreaterThan(0)),
     * );
     * ```
     */
    open = (): Task =>
        Task.where('#actor opens the Errors view',
            this.navigation.openView('Errors'),
        );
}
