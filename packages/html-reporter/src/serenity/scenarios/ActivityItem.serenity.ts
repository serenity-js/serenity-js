import type { QuestionAdapter } from '@serenity-js/core';
import { Attribute, By } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

export class ActivityItem<NET> extends InteractionObject<NET> {

    private activityIcon = () =>
        this.child(By.css('.activity-icon'))
            .describedAs('activity icon');

    name = (): QuestionAdapter<string> =>
        this.child(By.css('.activity-name')).text().trim()
            .describedAs('activity name');

    outcome = (): QuestionAdapter<string> =>
        Attribute.called('data-outcome').of(this.activityIcon())
            .describedAs('activity outcome');
}
