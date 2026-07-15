import type { QuestionAdapter } from '@serenity-js/core';
import { Attribute, Text } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

export class Delta<NET> extends InteractionObject<NET> {

    text = (): QuestionAdapter<string> =>
        Text.of(this.rootElement).trim()
            .describedAs('delta text');

    sentiment = (): QuestionAdapter<string> =>
        Attribute.called('class').of(this.rootElement)
            .as(classes => {
                if (classes.includes('kpi-delta--positive')) return 'positive';
                if (classes.includes('kpi-delta--negative')) return 'negative';
                return 'neutral';
            })
            .describedAs('delta sentiment');
}
