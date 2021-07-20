import { Answerable } from '@serenity-js/core';
import { ElementHandle } from 'playwright';

export interface TargetBuilder<T> {
    selectedBy(selector: string): T;
}

export interface NestedTargetBuilder<T> {
    of(parent: Answerable<ElementHandle>): TargetBuilder<T>;
}
