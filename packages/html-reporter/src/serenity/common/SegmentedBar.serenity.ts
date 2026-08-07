import type { Question, QuestionAdapter } from '@serenity-js/core';
import { Attribute, By, Text } from '@serenity-js/web';

import { InteractionObject } from './InteractionObject.serenity.js';

export class SegmentedBar<NET> extends InteractionObject<NET> {

    private hiddenText = () =>
        this.child(By.css('.visually-hidden'))
            .describedAs('visually-hidden text');

    private segments = () =>
        this.children(By.css('[aria-hidden="true"]'))
            .describedAs('bar segments');

    accessibleLabel = (): QuestionAdapter<string> =>
        Attribute.called('aria-label').of(this.rootElement)
            .describedAs('segmented bar accessible label');

    accessibleText = (): QuestionAdapter<string> =>
        Text.of(this.hiddenText()).trim()
            .describedAs('segmented bar accessible text');

    segmentCount = (): Question<Promise<number>> =>
        this.segments().count()
            .describedAs('number of bar segments');
}
