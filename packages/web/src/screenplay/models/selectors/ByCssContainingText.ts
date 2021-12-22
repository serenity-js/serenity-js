import { Answerable } from '@serenity-js/core';

import { Selector } from './Selector';

export class ByCssContainingText extends Selector<[ string, string ]> {
    constructor(selector: Answerable<string>, text: Answerable<string>) {
        super([ selector, text ]);
    }
}
