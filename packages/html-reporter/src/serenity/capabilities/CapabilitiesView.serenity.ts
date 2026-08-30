import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click, PageElement, PageElements, Select, Text, Value } from '@serenity-js/web';

import { link } from '../../navigation/link.js';
import { FilterBar } from '../common/FilterBar.serenity.js';
import type { InteractionObjectOptions } from '../common/InteractionObject.serenity.js';
import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ResultCount } from '../common/ResultCount.serenity.js';
import { SearchInput } from '../common/SearchInput.serenity.js';

/**
 * Interaction object representing the **Capabilities** view in the HTML report.
 *
 * Displays a requirements hierarchy tree with confidence scores, README panels,
 * scenario lists, and filtering/sorting controls. The tree panel on the left shows
 * capability nodes; selecting one shows its details (confidence, child capabilities,
 * README content, scenarios) in the right panel.
 *
 * Composes child interaction objects ({@link SearchInput}, {@link FilterBar},
 * {@link ResultCount}) for individual UI widgets.
 *
 * On mobile viewports, the tree panel lives inside a bottom sheet. The same
 * `selectCapability()`, `find()`, and `selectFilter()` methods work regardless of
 * viewport size when the `{ mobile: true }` option is set.
 *
 * ## Instantiation
 *
 * ```ts
 * import { CapabilitiesView, Navigation } from '@serenity-js/html-reporter/serenity';
 * import { By, PageElement } from '@serenity-js/web';
 *
 * const capabilitiesView = new CapabilitiesView(
 *   PageElement.located(By.css('[data-testid="capabilities"]')).describedAs('capabilities view'),
 *   new Navigation(),
 * );
 * ```
 *
 * ## Usage in an integration test
 *
 * ```ts
 * await actor.attemptsTo(
 *   capabilitiesView.open(),
 *   capabilitiesView.selectCapability('Authentication'),
 *   Ensure.that(capabilitiesView.confidence(), includes('85')),
 *   Ensure.that(capabilitiesView.detailTitle(), equals('Authentication')),
 *   Ensure.that(capabilitiesView.childCapabilityNames(), contain('Login')),
 * );
 * ```
 *
 * @group Interaction Objects
 */
export class CapabilitiesView<NET> extends InteractionObject<NET> {

    private static readonly treeNodeLabelSelector = By.css('.req-tree-label');

    // Structure — child interaction objects
    readonly searchInput = new SearchInput<NET>(this.rootElement.element(By.css('[data-testid="search-input"]')));
    readonly filterBar = new FilterBar<NET>(this.rootElement.element(By.css('[data-testid="filter-bar"]')));
    readonly resultCount = new ResultCount<NET>(this.rootElement.element(By.css('[data-testid="result-count"]')));

    // Mobile child IOs (inside bottom sheet)
    private readonly mobileSearchInput = new SearchInput<NET>(
        this.rootElement.element(By.css('[data-testid="bottom-sheet"] [data-testid="search-input"]'))
    );
    private readonly mobileFilterBar = new FilterBar<NET>(
        this.rootElement.element(By.css('[data-testid="bottom-sheet"] [data-testid="filter-bar"]'))
    );

    // Structure — page elements
    private readonly readmeLinks = this.rootElement.elements(By.css('.readme-content a')).describedAs('README links');
    private readonly detailConfidence = this.rootElement.element(By.css('.req-detail-confidence')).describedAs('detail panel confidence score');
    private readonly detailConfidenceLabel = this.rootElement.element(By.css('.req-detail-confidence-label')).describedAs('detail panel confidence label');
    private readonly detailScenarioCount = this.rootElement.element(By.css('.req-detail-scenario-count')).describedAs('detail panel scenario count');
    private readonly childNames = this.rootElement.elements(By.css('.req-detail-child-name')).describedAs('child capability names');
    private readonly treeNodes = this.rootElement.elements(By.css('.req-tree-node')).describedAs('tree nodes');
    private readonly readmeSection = this.rootElement.element(By.css('.readme-content')).describedAs('README section');
    private readonly collapsibleReadme = this.rootElement.elements(By.css('details .readme-content')).describedAs('collapsible README sections');
    private readonly sortSelectElement = this.rootElement.element(By.css('.sort-select')).describedAs('sort dropdown');
    private readonly detailTitleElement = this.rootElement.element(By.css('.req-detail-title')).describedAs('detail title');

    // Mobile helpers
    private treeSheetTrigger = () =>
        this.rootElement.element(By.css('[aria-label="Browse capabilities"]'))
            .describedAs('tree sheet trigger');

    private bottomSheetClose = () =>
        this.rootElement.element(By.css('[data-testid="bottom-sheet"] .bottom-sheet-close'))
            .describedAs('bottom sheet close button');

    private openTreeSheet = (): Task =>
        Task.where('#actor opens the capabilities tree sheet',
            Click.on(this.treeSheetTrigger()),
        );

    private closeTreeSheet = (): Task =>
        Task.where('#actor closes the capabilities tree sheet',
            Click.on(this.bottomSheetClose()),
        );

    constructor(rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation = new Navigation(), options?: InteractionObjectOptions) {
        super(rootElement, options);
    }

    // Behaviour — questions

    /**
     * The confidence score for the currently selected capability (e.g. `'85%'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.confidence(), equals('85%'))
     * ```
     */
    confidence = (): QuestionAdapter<string> =>
        this.detailConfidence.text().trim()
            .describedAs('selected capability confidence');

    /**
     * The confidence label text (e.g. `'Confidence'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.confidenceLabel(), equals('Confidence'))
     * ```
     */
    confidenceLabel = (): QuestionAdapter<string> =>
        this.detailConfidenceLabel.text().trim()
            .describedAs('confidence label');

    /**
     * The scenario count text for the selected capability (e.g. `'12 scenarios'`).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.scenarioCount(), includes('12'))
     * ```
     */
    scenarioCount = (): QuestionAdapter<string> =>
        this.detailScenarioCount.text().trim()
            .describedAs('selected capability scenario count');

    /**
     * The names of child capabilities listed in the detail panel.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.childCapabilityNames(), contain('Login'))
     * ```
     */
    childCapabilityNames = (): Question<Promise<string[]>> =>
        this.childNames
            .eachMappedTo(Text)
            .describedAs('child capability names');

    /**
     * The rendered README content text for the selected capability.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.readmeContent(), includes('Authentication module'))
     * ```
     */
    readmeContent = (): QuestionAdapter<string> =>
        this.readmeSection.text().trim()
            .describedAs('README content');

    /**
     * Whether the README section is present for the selected capability.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.readmeIsPresent(), equals(true))
     * ```
     */
    readmeIsPresent = (): Question<Promise<boolean>> =>
        this.readmeSection.isPresent()
            .describedAs('whether README is present');

    /**
     * Whether the README section is inside a collapsible `<details>` element.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.readmeIsCollapsible(), equals(true))
     * ```
     */
    readmeIsCollapsible = (): Question<Promise<boolean>> =>
        this.collapsibleReadme.count()
            .as(count => count > 0)
            .describedAs('whether README is inside a collapsible');

    /**
     * The labels of all available sort dropdown options.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.sortOptions(), equals(['Name', 'Confidence', 'Scenarios']))
     * ```
     */
    sortOptions = (): Question<Promise<string[]>> =>
        PageElements.located(By.css('option'))
            .of(this.sortSelectElement)
            .eachMappedTo(Text)
            .describedAs('sort dropdown option labels');

    /**
     * The currently selected sort option value.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.selectedSort(), equals('name'))
     * ```
     */
    selectedSort = (): QuestionAdapter<string> =>
        Value.of(this.sortSelectElement)
            .describedAs('selected sort option');

    /**
     * The labels of all tree nodes in the capability hierarchy.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.treeNodeLabels(), contain('Authentication'))
     * ```
     */
    treeNodeLabels = (): Question<Promise<string[]>> =>
        this.treeNodes
            .eachMappedTo(Text.of(PageElement.located(CapabilitiesView.treeNodeLabelSelector)))
            .describedAs('tree node labels');

    /**
     * The labels of child tree nodes (excluding the root node).
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.childTreeNodeLabels(), equals(['Login', 'Logout']))
     * ```
     */
    childTreeNodeLabels = (): Question<Promise<string[]>> =>
        this.treeNodes
            .eachMappedTo(Text.of(PageElement.located(CapabilitiesView.treeNodeLabelSelector)))
            .as(labels => labels.slice(1))
            .describedAs('child tree node labels (excluding root)');

    /**
     * The title text shown in the detail panel for the selected capability.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.detailTitle(), equals('Authentication'))
     * ```
     */
    detailTitle = (): QuestionAdapter<string> =>
        this.detailTitleElement.text().trim()
            .describedAs('detail panel title');

    /**
     * The `href` attribute of a link within the README content, located by link text.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.readmeLinkHref('API docs'), includes('serenity-js.org'))
     * ```
     *
     * @param linkText
     *  Substring to match against link text within the README
     */
    readmeLinkHref = (linkText: string): QuestionAdapter<string> =>
        Attribute.called('href').of(
            this.readmeLinks
                .where(Text, includes(linkText))
                .first()
                .describedAs(`README link "${linkText}"`)
        ).describedAs(`href of README link "${linkText}"`);

    /**
     * The empty state text shown when no capabilities are found.
     *
     * ## Example
     *
     * ```ts
     * Ensure.that(capabilitiesView.emptyStateText(), includes('No capabilities'))
     * ```
     */
    emptyStateText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).trim()
            .describedAs('empty state text');

    // Behaviour — tasks

    /**
     * Navigates to the Capabilities view via the sidebar navigation.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   capabilitiesView.open(),
     * );
     * ```
     */
    open = (): Task =>
        Task.where('#actor opens the Capabilities view',
            this.navigation.openView('Capabilities'),
        );

    /**
     * Selects a capability node in the tree by its label text.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   capabilitiesView.selectCapability('Authentication'),
     *   Ensure.that(capabilitiesView.detailTitle(), equals('Authentication')),
     * );
     * ```
     *
     * @param name
     *  Substring to match against tree node labels
     */
    selectCapability = (name: Answerable<string>): Task =>
        Task.where(the`#actor selects capability ${name}`,
            Click.on(this.treeNodes
                .where(Text.of(PageElement.located(CapabilitiesView.treeNodeLabelSelector)), includes(name))
                .first()
                .describedAs(the`tree node ${name}`)
            ),
        );

    /**
     * Activates a filter chip by label (e.g. `'Failed'`, `'Passed'`).
     *
     * On mobile viewports, opens the tree bottom sheet to access filters.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   capabilitiesView.selectFilter('Failed'),
     * );
     * ```
     *
     * @param label
     *  The filter chip label to activate
     */
    selectFilter = (label: Answerable<string>): Task =>
        this.mobile
            ? Task.where(the`#actor selects the ${label} filter`,
                this.openTreeSheet(),
                this.mobileFilterBar.selectFilter(label),
                this.closeTreeSheet(),
            )
            : this.filterBar.selectFilter(label);

    /**
     * Searches for capabilities by entering text into the search input.
     *
     * On mobile viewports, opens the tree bottom sheet to access the search input.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   capabilitiesView.find('auth'),
     * );
     * ```
     *
     * @param searchTerm
     *  Text to search for (matches capability names)
     */
    find = (searchTerm: Answerable<string>): Task =>
        this.mobile
            ? Task.where(the`#actor searches for ${searchTerm}`,
                this.openTreeSheet(),
                this.mobileSearchInput.searchFor(searchTerm),
                this.closeTreeSheet(),
            )
            : Task.where(the`#actor searches for ${searchTerm}`,
                this.searchInput.searchFor(searchTerm),
            );

    /**
     * Clicks a link within the README content section.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   capabilitiesView.followReadmeLink('API documentation'),
     * );
     * ```
     *
     * @param linkText
     *  Substring to match against link text within the README
     */
    followReadmeLink = (linkText: Answerable<string>): Task =>
        Task.where(the`#actor follows the ${linkText} link in the README`,
            Click.on(this.readmeLinks
                .where(Text, includes(linkText))
                .first()
                .describedAs(the`README link ${linkText}`)
            ),
        );

    /**
     * Selects a sort option from the sort dropdown.
     *
     * On mobile viewports, opens the tree bottom sheet to access the sort dropdown.
     *
     * ## Example
     *
     * ```ts
     * await actor.attemptsTo(
     *   capabilitiesView.selectSort('confidence'),
     *   Ensure.that(capabilitiesView.selectedSort(), equals('confidence')),
     * );
     * ```
     *
     * @param option
     *  The sort option value to select
     */
    selectSort = (option: Answerable<string>): Task =>
        this.mobile
            ? Task.where(the`#actor sorts by ${option}`,
                this.openTreeSheet(),
                Select.value(option).from(this.rootElement.element(By.css('[data-testid="bottom-sheet"] .sort-select')).describedAs('mobile sort dropdown')),
                this.closeTreeSheet(),
            )
            : Task.where(the`#actor sorts by ${option}`,
                Select.value(option).from(this.sortSelectElement),
            );

    // URL helpers — type-safe navigation URLs using the same link() function as components

    /**
     * Builds URL for viewing capability detail.
     * 
     * @param path - Capability tree path (e.g., 'authentication/login')
     * @returns URL path with hash and query parameters
     * 
     * ## Example
     * 
     * ```ts
     * view.capabilityDetailUrl('authentication/login')
     * // → '#/capabilities?path=authentication%2Flogin'
     * ```
     */
    capabilityDetailUrl = (path: string): string =>
        '#' + link({ view: 'capabilities', path });
}
