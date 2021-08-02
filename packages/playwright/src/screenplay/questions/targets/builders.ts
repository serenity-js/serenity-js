import { Answerable } from '@serenity-js/core';
import { ElementHandle } from 'playwright';

import { Locator } from './locators';

export interface TargetBuilder<T> {
    located(selector: Locator): T;
}

export interface NestedTargetBuilder<T> {
    of(parent: Answerable<ElementHandle>): TargetBuilder<T>;
}
