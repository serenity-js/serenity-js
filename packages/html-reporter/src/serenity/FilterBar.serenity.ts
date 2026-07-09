import type { Answerable } from '@serenity-js/core';
import { Interaction, Question, the } from '@serenity-js/core';
import { By, PageElement, PageElements } from '@serenity-js/web';

export class FilterBar<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
    }

    private chips = () =>
        PageElements.located(By.css('.filter-chip'))
            .of(this.rootElement)
            .describedAs('filter chips');

    private sortSelect = () =>
        PageElement.located(By.css('.sort-select'))
            .of(this.rootElement)
            .describedAs('sort dropdown');

    filterLabels = (): Question<Promise<string[]>> =>
        Question.about('filter chip labels', async actor => {
            const elements = await actor.answer(this.chips());
            const labels: string[] = [];
            for (const element of elements) {
                const text = await element.text();
                labels.push(text.replace(/\s*\d+\s*$/, '').trim());
            }
            return labels;
        });

    activeFilters = (): Question<Promise<string[]>> =>
        Question.about('active filter labels', async actor => {
            const elements = await actor.answer(this.chips());
            const active: string[] = [];
            for (const element of elements) {
                const pressed = await element.attribute('aria-pressed');
                if (pressed === 'true') {
                    const text = await element.text();
                    active.push(text.replace(/\s*\d+\s*$/, '').trim());
                }
            }
            return active;
        });

    selectFilter = (label: Answerable<string>): Interaction =>
        Interaction.where(the`#actor selects the "${label}" filter`, async actor => {
            const labelText = await actor.answer(label);
            const elements = await actor.answer(this.chips());
            for (const element of elements) {
                const text = await element.text();
                if (text.replace(/\s*\d+\s*$/, '').trim() === labelText) {
                    await element.click();
                    return;
                }
            }
            throw new Error(`Filter chip "${labelText}" not found`);
        });

    selectedSort = (): Question<Promise<string>> =>
        Question.about('selected sort option', async actor => {
            const select = await actor.answer(this.sortSelect());
            return (await select.value()) || '';
        });
}
