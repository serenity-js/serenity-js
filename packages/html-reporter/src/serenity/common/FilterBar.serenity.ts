import { equals, includes } from '@serenity-js/assertions';
import type { Answerable, Question } from '@serenity-js/core';
import type { QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click, PageElement, Text, Value } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

export class FilterBar<NET> extends InteractionObject<NET> {

    private chips = () =>
        this.children(By.css('.filter-chip'))
            .describedAs('filter chips');

    private chipLabel = () =>
        PageElement.located(By.css('.chip-label'));

    private sortSelect = () =>
        this.child(By.css('.sort-select'))
            .describedAs('sort dropdown');

    filterLabels = (): Question<Promise<string[]>> =>
        this.chips()
            .eachMappedTo(Text.of(this.chipLabel()))
            .describedAs('filter chip labels');

    activeFilters = (): Question<Promise<string[]>> =>
        this.chips()
            .where(Attribute.called('aria-pressed'), equals('true'))
            .eachMappedTo(Text.of(this.chipLabel()))
            .describedAs('active filter labels');

    selectFilter = (label: Answerable<string>): Task =>
        Task.where(the`#actor selects the "${label}" filter`,
            Click.on(this.chips()
                .where(Text.of(this.chipLabel()), includes(label))
                .first()
                .describedAs(the`filter chip "${label}"`)
            ),
        );

    selectedSort = (): QuestionAdapter<string> =>
        Value.of(this.sortSelect())
            .describedAs('selected sort option');
}
