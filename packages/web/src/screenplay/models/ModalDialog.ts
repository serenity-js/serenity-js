import { Adapter, Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';

export abstract class ModalDialog {
    static window(): Question<Promise<ModalDialog>> & Adapter<ModalDialog> {
        return Question.about<Promise<ModalDialog>>('modal dialog', actor => {
            return BrowseTheWeb.as(actor).modalDialog();
        });
    }

    abstract accept(): Promise<void>;
    abstract dismiss(): Promise<void>;

    abstract text(): Promise<string>;
    abstract enterValue(value: string | number | Array<string | number>): Promise<void>;

    abstract isPresent(): Promise<boolean>;
}
