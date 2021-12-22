import { Answerable } from '@serenity-js/core';

import { Selector } from './Selector';

export class ByCss extends Selector<[ string ]> {
    constructor(selector: Answerable<string>) {
        super([ selector ]);
    }
}
