import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By, Click, Text } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';
import { RestQueryPanel } from '../common/RestQueryPanel.serenity.js';

export class ActivityNode<NET> extends InteractionObject<NET> {

    private restBadge = () =>
        this.child(By.css('.rest-badge'))
            .describedAs('REST badge');

    private restQueryPanelElement = () =>
        this.child(By.css('[data-testid="rest-query-panel"]'))
            .describedAs('REST query panel');

    private reportDataBlocks = () =>
        this.children(By.css('.report-data-block'))
            .describedAs('report data blocks');

    readonly restPanel: RestQueryPanel<NET>;

    constructor(rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>) {
        super(rootElement);
        this.restPanel = new RestQueryPanel(this.restQueryPanelElement());
    }

    hasRestBadge = (): Question<Promise<boolean>> =>
        this.restBadge().isPresent()
            .describedAs('whether the REST badge is visible');

    expandRestPanel = (): Task =>
        Task.where('#actor expands the REST panel',
            Click.on(this.restBadge()),
        );

    restPanelContent = (): QuestionAdapter<string> =>
        Text.of(this.restQueryPanelElement())
            .describedAs('REST panel content');

    reportDataCount = (): QuestionAdapter<number> =>
        this.reportDataBlocks().count()
            .describedAs('number of report data blocks');

    reportDataContent = (): Question<Promise<string[]>> =>
        this.reportDataBlocks().eachMappedTo(Text)
            .describedAs('report data block contents');
}
