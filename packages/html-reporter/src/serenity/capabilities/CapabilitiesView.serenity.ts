import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click, PageElement, PageElements, Select, Text, Value } from '@serenity-js/web';

import { FilterBar } from '../common/FilterBar.serenity.js';
import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ResultCount } from '../common/ResultCount.serenity.js';
import { SearchInput } from '../common/SearchInput.serenity.js';

export class CapabilitiesView<NET> extends InteractionObject<NET> {

    readonly searchInput: SearchInput<NET>;
    readonly filterBar: FilterBar<NET>;
    readonly resultCount: ResultCount<NET>;

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);

        this.searchInput = new SearchInput(this.child(By.css('[data-testid="search-input"]')));
        this.filterBar = new FilterBar(this.child(By.css('[data-testid="filter-bar"]')));
        this.resultCount = new ResultCount(this.child(By.css('[data-testid="result-count"]')));
    }

    private detailConfidence = () =>
        this.child(By.css('.req-detail-confidence'))
            .describedAs('detail panel confidence score');

    private detailConfidenceLabel = () =>
        this.child(By.css('.req-detail-confidence-label'))
            .describedAs('detail panel confidence label');

    private detailScenarioCount = () =>
        this.child(By.css('.req-detail-scenario-count'))
            .describedAs('detail panel scenario count');

    private childNames = () =>
        this.children(By.css('.req-detail-child-name'))
            .describedAs('child capability names');

    private treeNodes = () =>
        this.children(By.css('.req-tree-node'))
            .describedAs('tree nodes');

    private treeNodeLabel = () =>
        PageElement.located(By.css('.req-tree-label'));

    private readmeSection = () =>
        this.child(By.css('.readme-content'))
            .describedAs('README section');

    private collapsibleReadme = () =>
        this.children(By.css('details .readme-content'))
            .describedAs('collapsible README sections');

    private sortSelect = () =>
        this.child(By.css('.sort-select'))
            .describedAs('sort dropdown');

    private sortOptionElements = () =>
        PageElements.located(By.css('option'))
            .of(this.sortSelect())
            .describedAs('sort dropdown options');

    private detailTitleElement = () =>
        this.child(By.css('.req-detail-title'))
            .describedAs('detail title');

    open = (): Task =>
        Task.where('#actor opens the Capabilities view',
            this.navigation.openView('Capabilities'),
        );

    confidence = (): QuestionAdapter<string> =>
        this.detailConfidence().text().trim()
            .describedAs('selected capability confidence');

    confidenceLabel = (): QuestionAdapter<string> =>
        this.detailConfidenceLabel().text().trim()
            .describedAs('confidence label');

    scenarioCount = (): QuestionAdapter<string> =>
        this.detailScenarioCount().text().trim()
            .describedAs('selected capability scenario count');

    childCapabilityNames = (): Question<Promise<string[]>> =>
        this.childNames()
            .eachMappedTo(Text)
            .describedAs('child capability names');

    selectCapability = (name: Answerable<string>): Task =>
        Task.where(the`#actor selects capability "${name}"`,
            Click.on(this.treeNodes()
                .where(Text.of(this.treeNodeLabel()), includes(name))
                .first()
                .describedAs(the`tree node "${name}"`)
            ),
        );

    followReadmeLink = (linkText: Answerable<string>): Task =>
        Task.where(the`#actor follows the "${linkText}" link in the README`,
            Click.on(this.children(By.css('.readme-content a'))
                .where(Text, includes(linkText))
                .first()
                .describedAs(the`README link "${linkText}"`)
            ),
        );

    readmeLinkHref = (linkText: string): QuestionAdapter<string> =>
        Attribute.called('href').of(
            this.children(By.css('.readme-content a'))
                .where(Text, includes(linkText))
                .first()
                .describedAs(`README link "${linkText}"`)
        ).describedAs(`href of README link "${linkText}"`);

    readmeContent = (): QuestionAdapter<string> =>
        this.readmeSection().text().trim()
            .describedAs('README content');

    readmeIsVisible = (): Question<Promise<boolean>> =>
        this.readmeSection().isPresent()
            .describedAs('whether README is visible');

    readmeIsCollapsible = (): Question<Promise<boolean>> =>
        this.collapsibleReadme().count()
            .as(count => count > 0)
            .describedAs('whether README is inside a collapsible');

    sortOptions = (): Question<Promise<string[]>> =>
        this.sortOptionElements()
            .eachMappedTo(Text)
            .describedAs('sort dropdown option labels');

    selectedSort = (): QuestionAdapter<string> =>
        Value.of(this.sortSelect())
            .describedAs('selected sort option');

    selectSort = (option: Answerable<string>): Task =>
        Task.where(the`#actor sorts by "${option}"`,
            Select.value(option).from(this.sortSelect()),
        );

    treeNodeLabels = (): Question<Promise<string[]>> =>
        this.treeNodes()
            .eachMappedTo(Text.of(this.treeNodeLabel()))
            .describedAs('tree node labels');

    childTreeNodeLabels = (): Question<Promise<string[]>> =>
        this.treeNodes()
            .eachMappedTo(Text.of(this.treeNodeLabel()))
            .as(labels => labels.slice(1))
            .describedAs('child tree node labels (excluding root)');

    detailTitle = (): QuestionAdapter<string> =>
        this.detailTitleElement().text().trim()
            .describedAs('detail panel title');

    emptyStateText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).trim()
            .describedAs('empty state text');
}
