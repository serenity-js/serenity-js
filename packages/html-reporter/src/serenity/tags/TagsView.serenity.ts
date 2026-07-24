import { includes } from '@serenity-js/assertions';
import type { Answerable, Question, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By, Click, Text } from '@serenity-js/web';

import { FilterBar } from '../common/FilterBar.serenity.js';
import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { Navigation } from '../common/Navigation.serenity.js';
import { ResultCount } from '../common/ResultCount.serenity.js';
import { SearchInput } from '../common/SearchInput.serenity.js';

export class TagsView<NET> extends InteractionObject<NET> {

    readonly searchInput = new SearchInput<NET>(this.child(By.css('[data-testid="search-input"]')));
    readonly filterBar = new FilterBar<NET>(this.child(By.css('[data-testid="filter-bar"]')));
    readonly resultCount = new ResultCount<NET>(this.child(By.css('[data-testid="result-count"]')));

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>, private readonly navigation: Navigation = new Navigation()) {
        super(rootElement);
    }

    private tagCards = () =>
        this.children(By.css('.tag-card'))
            .describedAs('tag cards');

    private groupHeaders = () =>
        this.children(By.css('.grid-section-header'))
            .describedAs('tag group headers');

    tagCount = (): Question<Promise<number>> =>
        this.tagCards().count().describedAs('number of tag cards');

    tagNames = (): Question<Promise<string[]>> =>
        this.children(By.css('.tag-card .tag-card-name'))
            .eachMappedTo(Text)
            .describedAs('tag card names');

    groupHeadings = (): Question<Promise<string[]>> =>
        this.groupHeaders()
            .eachMappedTo(Text)
            .describedAs('tag group headings');

    tagCardText = (name: string): QuestionAdapter<string> =>
        this.tagCards()
            .where(Text, includes(name))
            .first()
            .describedAs(`tag card "${name}"`)
            .text()
            .describedAs(`text of tag card "${name}"`);

    selectTag = (name: Answerable<string>): Task =>
        Task.where(the`#actor selects the ${name} tag`,
            Click.on(this.tagCards()
                .where(Text, includes(name))
                .first()
                .describedAs(the`tag card ${name}`)
            ),
        );

    find = (searchTerm: Answerable<string>): Task =>
        Task.where(the`#actor searches for ${searchTerm}`,
            this.searchInput.enter(searchTerm),
        );

    selectFilter = (label: Answerable<string>): Task =>
        this.filterBar.selectFilter(label);

    resultCountText = (): QuestionAdapter<string> =>
        this.resultCount.text();

    open = (): Task =>
        Task.where('#actor opens the Tags view',
            this.navigation.openView('Tags'),
        );
}
