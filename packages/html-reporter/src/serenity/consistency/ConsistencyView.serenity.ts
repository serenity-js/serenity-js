import { includes } from '@serenity-js/assertions';
import type { Answerable, Question } from '@serenity-js/core';
import type { QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { By, PageElement, Text } from '@serenity-js/web';

import { FilterBar } from '../common/FilterBar.serenity.js';
import { HistoryDots } from '../common/HistoryDots.serenity.js';
import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { OutcomeBadge } from '../common/OutcomeBadge.serenity.js';
import { ResultCount } from '../common/ResultCount.serenity.js';
import { SearchInput } from '../common/SearchInput.serenity.js';
import { ScenarioItem } from '../scenarios/ScenarioItem.serenity.js';

export class ConsistencyView<NET> extends InteractionObject<NET> {

    private static readonly scenarioNameSelector = By.css('.scenario-name');

    // Structure — child interaction objects
    readonly searchInput = new SearchInput<NET>(this.child(By.css('[data-testid="search-input"]')));
    readonly filterBar = new FilterBar<NET>(this.child(By.css('[data-testid="filter-bar"]')));
    readonly resultCount = new ResultCount<NET>(this.child(By.css('[data-testid="result-count"]')));
    readonly historyDots = new HistoryDots<NET>(this.child(By.css('[data-testid="history-dots"]')));

    // Structure — page elements
    private readonly scenarioItems = this.children(By.css('.scenario-item')).describedAs('consistency scenario items');
    private readonly scenarioNameElements = this.children(ConsistencyView.scenarioNameSelector).describedAs('consistency scenario names');

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    // Behaviour — questions (what the user observes)

    outcomeBadgeFor = (scenarioItem: Answerable<PageElement<NET>>): OutcomeBadge<NET> =>
        new OutcomeBadge<NET>(PageElement.located<NET>(By.css('[data-testid="outcome-badge"]')).of(scenarioItem));

    scenarioCount = (): Question<Promise<number>> =>
        this.scenarioItems.count().describedAs('number of consistency scenarios');

    scenarioCalled = (name: string): ScenarioItem<NET> => {
        const matchingItem = this.scenarioItems
            .where(Text.of(PageElement.located(ConsistencyView.scenarioNameSelector)), includes(name))
            .first()
            .describedAs(`consistency scenario called "${name}"`);
        return new ScenarioItem(matchingItem);
    };

    scenarioNames = (): Question<Promise<string[]>> =>
        this.scenarioNameElements
            .eachMappedTo(Text)
            .describedAs('consistency scenario names');

    bodyText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).describedAs('consistency view text');

    // Behaviour — tasks (what the user does)

    find = (searchTerm: Answerable<string>): Task =>
        Task.where(the`#actor searches for ${searchTerm}`,
            this.searchInput.enter(searchTerm),
        );

    open = (): Task =>
        Task.where('#actor opens the Consistency view',
            this.navigation.openView('Consistency'),
        );
}
