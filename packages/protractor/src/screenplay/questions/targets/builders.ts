import { Question } from '@serenity-js/core';
import { ElementFinder, Locator } from 'protractor';

export interface TargetBuilder<T> {
    located(byLocator: Locator): T;
}

export interface NestedTargetBuilder<T> {
    of(parent: Question<ElementFinder> | ElementFinder): TargetBuilder<T>;
}
