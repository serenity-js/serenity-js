import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, Click, PageElement, Text } from '@serenity-js/web';

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

    open = (): Task =>
        Task.where('#actor opens the Capabilities view',
            this.navigation.openView('Capabilities'),
        );

    confidence = (): QuestionAdapter<string> =>
        this.detailConfidence().text().trim()
            .describedAs('selected capability confidence');

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
}
