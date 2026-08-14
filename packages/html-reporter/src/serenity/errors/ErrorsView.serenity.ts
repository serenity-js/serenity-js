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

/** @package */
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

    openStatsSheet = (): Task =>
        Task.where('#actor opens the error stats sheet',
            Check.whether(this.statsSheetTrigger(), isVisible())
                .andIfSo(Click.on(this.statsSheetTrigger())),
        );

    closeStatsSheet = (): Task =>
        Task.where('#actor closes the error stats sheet',
            Check.whether(this.bottomSheetClose(), isVisible())
                .andIfSo(Click.on(this.bottomSheetClose())),
        );

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation(), options?: InteractionObjectOptions) {
        super(rootElement, options);
    }

    // Behaviour — questions

    kpiCardAt = (index: number): KpiCard<NET> =>
        new KpiCard(this.kpiCards.nth(index));

    kpiCardCalled = (label: string): KpiCard<NET> => {
        const cards = this.mobile ? this.mobileKpiCards : this.kpiCards;
        const cardElement = cards
            .where(Text.of(PageElement.located(By.css('.kpi-label'))), includes(label.toUpperCase()))
            .first()
            .describedAs(`KPI card called "${label}"`);
        return new KpiCard(cardElement);
    };

    scenarioCalled = (name: string): ScenarioItem<NET> => {
        const matchingItem = this.scenarioItems
            .where(Text.of(PageElement.located(ErrorsView.scenarioNameSelector)), includes(name))
            .first()
            .describedAs(`errors scenario called "${name}"`);
        return new ScenarioItem(matchingItem);
    };

    errorGroupTextFor = (name: string): QuestionAdapter<string> =>
        this.scenarioItems
            .where(Text.of(PageElement.located(ErrorsView.scenarioNameSelector)), includes(name))
            .first()
            .text()
            .describedAs(`error group text for "${name}"`);

    scenarioNames = (): Question<Promise<string[]>> =>
        this.scenarioNameElements
            .eachMappedTo(Text)
            .describedAs('errors scenario names');

    bodyText = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).describedAs('errors view body text');

    errorGroupCount = (): QuestionAdapter<number> =>
        this.scenarioItems.count()
            .describedAs('error group count');

    // Behaviour — tasks

    find = (searchTerm: Answerable<string>): Task =>
        this.mobile
            ? Task.where(the`#actor searches for ${searchTerm}`,
                this.openFilterSheet(),
                this.mobileSearchInput.enter(searchTerm),
                this.closeFilterSheet(),
            )
            : Task.where(the`#actor searches for ${searchTerm}`,
                this.searchInput.enter(searchTerm),
            );

    resultCountText = (): QuestionAdapter<string> =>
        this.resultCount.text();

    clickFirstErrorGroup = (): Task =>
        Task.where('#actor clicks the first error group',
            Click.on(
                this.scenarioItems.first()
                    .describedAs('first error group'),
            ),
        );

    clickErrorGroupContaining = (text: Answerable<string>): Task =>
        Task.where(the`#actor clicks the error group containing ${ text }`,
            Click.on(
                this.scenarioItems
                    .where(Text, includes(text))
                    .first()
                    .describedAs(the`error group containing ${ text }`),
            ),
        );

    open = (): Task =>
        Task.where('#actor opens the Errors view',
            this.navigation.openView('Errors'),
        );
}
