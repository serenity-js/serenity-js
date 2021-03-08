import { List as CoreList, Question } from '@serenity-js/core';
import { ElementArrayFinderListAdapter } from './lists';
import { ElementArrayFinder, ElementFinder } from 'protractor';

export class List {
    static of(items: Question<ElementArrayFinder> | ElementArrayFinder) {
        return new CoreList<ElementArrayFinderListAdapter, ElementFinder, ElementArrayFinder>(new ElementArrayFinderListAdapter(items))
    }
}
