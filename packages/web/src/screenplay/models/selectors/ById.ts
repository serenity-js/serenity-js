import { Answerable } from '@serenity-js/core';

import { Selector } from './Selector';

export class ById extends Selector<[ string ]> {
    constructor(selector: Answerable<string>) {
        super([ selector ]);
    }
}
