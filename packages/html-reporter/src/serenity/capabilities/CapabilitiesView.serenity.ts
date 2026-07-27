import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click, PageElement, PageElements, Select, Text, Value } from '@serenity-js/web';

import { link } from '../../utils/link.js';
import { FilterBar } from '../common/FilterBar.serenity.js';
import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ResultCount } from '../common/ResultCount.serenity.js';
import { SearchInput } from '../common/SearchInput.serenity.js';

export class CapabilitiesView<NET> extends InteractionObject<NET> {

    private static readonly treeNodeLabelSelector = By.css('.req-tree-label');

    // Structure — child interaction objects
    readonly searchInput = new SearchInput<NET>(this.child(By.css('[data-testid="search-input"]')));
    readonly filterBar = new FilterBar<NET>(this.child(By.css('[data-testid="filter-bar"]')));
    readonly resultCount = new ResultCount<NET>(this.child(By.css('[data-testid="result-count"]')));

    // Structure — page elements
    private readonly readmeLinks = this.children(By.css('.readme-content a')).describedAs('README links');
    private readonly detailConfidence = this.child(By.css('.req-detail-confidence')).describedAs('detail panel confidence score');
    private readonly detailConfidenceLabel = this.child(By.css('.req-detail-confidence-label')).describedAs('detail panel confidence label');
    private readonly detailScenarioCount = this.child(By.css('.req-detail-scenario-count')).describedAs('detail panel scenario count');
    private readonly childNames = this.children(By.css('.req-detail-child-name')).describedAs('child capability names');
    private readonly treeNodes = this.children(By.css('.req-tree-node')).describedAs('tree nodes');
    private readonly readmeSection = this.child(By.css('.readme-content')).describedAs('README section');
    private readonly collapsibleReadme = this.children(By.css('details .readme-content')).describedAs('collapsible README sections');
    private readonly sortSelectElement = this.child(By.css('.sort-select')).describedAs('sort dropdown');
    private readonly detailTitleElement = this.child(By.css('.req-detail-title')).describedAs('detail title');

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    // Behaviour — questions

    confidence = (): QuestionAdapter<string> =>
        this.detailConfidence.text().trim()
            .describedAs('selected capability confidence');

    confidenceLabel = (): QuestionAdapter<string> =>
        this.detailConfidenceLabel.text().trim()
            .describedAs('confidence label');

    scenarioCount = (): QuestionAdapter<string> =>
        this.detailScenarioCount.text().trim()
            .describedAs('selected capability scenario count');

    childCapabilityNames = (): Question<Promise<string[]>> =>
        this.childNames
            .eachMappedTo(Text)
            .describedAs('child capability names');

    readmeContent = (): QuestionAdapter<string> =>
        this.readmeSection.text().trim()
            .describedAs('README content');

    readmeIsVisible = (): Question<Promise<boolean>> =>
        this.readmeSection.isPresent()
            .describedAs('whether README is visible');

    readmeIsCollapsible = (): Question<Promise<boolean>> =>
        this.collapsibleReadme.count()
            .as(count => count > 0)
            .describedAs('whether README is inside a collapsible');

    sortOptions = (): Question<Promise<string[]>> =>
        PageElements.located(By.css('option'))
            .of(this.sortSelectElement)
            .eachMappedTo(Text)
            .describedAs('sort dropdown option labels');

    selectedSort = (): QuestionAdapter<string> =>
        Value.of(this.sortSelectElement)
            .describedAs('selected sort option');

    treeNodeLabels = (): Question<Promise<string[]>> =>
        this.treeNodes
            .eachMappedTo(Text.of(PageElement.located(CapabilitiesView.treeNodeLabelSelector)))
            .describedAs('tree node labels');

    childTreeNodeLabels = (): Question<Promise<string[]>> =>
        this.treeNodes
            .eachMappedTo(Text.of(PageElement.located(CapabilitiesView.treeNodeLabelSelector)))
            .as(labels => labels.slice(1))
            .describedAs('child tree node labels (excluding root)');

    detailTitle = (): QuestionAdapter<string> =>
        this.detailTitleElement.text().trim()
            .describedAs('detail panel title');

    readmeLinkHref = (linkText: string): QuestionAdapter<string> =>
        Attribute.called('href').of(
            this.readmeLinks
                .where(Text, includes(linkText))
                .first()
                .describedAs(`README link "${linkText}"`)
        ).describedAs(`href of README link "${linkText}"`);

    emptyStateText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).trim()
            .describedAs('empty state text');

    // Behaviour — tasks

    open = (): Task =>
        Task.where('#actor opens the Capabilities view',
            this.navigation.openView('Capabilities'),
        );

    selectCapability = (name: Answerable<string>): Task =>
        Task.where(the`#actor selects capability ${name}`,
            Click.on(this.treeNodes
                .where(Text.of(PageElement.located(CapabilitiesView.treeNodeLabelSelector)), includes(name))
                .first()
                .describedAs(the`tree node ${name}`)
            ),
        );

    selectFilter = (label: Answerable<string>): Task =>
        this.filterBar.selectFilter(label);

    find = (searchTerm: Answerable<string>): Task =>
        Task.where(the`#actor searches for ${searchTerm}`,
            this.searchInput.enter(searchTerm),
        );

    followReadmeLink = (linkText: Answerable<string>): Task =>
        Task.where(the`#actor follows the ${linkText} link in the README`,
            Click.on(this.readmeLinks
                .where(Text, includes(linkText))
                .first()
                .describedAs(the`README link ${linkText}`)
            ),
        );

    selectSort = (option: Answerable<string>): Task =>
        Task.where(the`#actor sorts by ${option}`,
            Select.value(option).from(this.sortSelectElement),
        );

    // URL helpers — type-safe navigation URLs using the same link() function as components

    /**
     * Builds URL for viewing capability detail.
     * 
     * @param path - Capability tree path (e.g., 'authentication/login')
     * @returns URL path with hash and query parameters
     * 
     * @example
     * view.capabilityDetailUrl('authentication/login')
     * // → '#/capabilities?path=authentication%2Flogin'
     */
    capabilityDetailUrl = (path: string): string =>
        '#' + link({ view: 'capabilities', path });
}
