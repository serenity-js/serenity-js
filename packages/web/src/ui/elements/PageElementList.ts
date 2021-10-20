import { PageElementLocation } from '../locations';
import { PageElement } from './PageElement';

export interface PageElementList {
    location(): PageElementLocation;

    count(): Promise<number>;
    first(): PageElement;
    last(): PageElement;
    get(index: number): PageElement;

    map<O>(fn: (element: PageElement, index?: number, elements?: PageElementList) => Promise<O> | O): Promise<O[]>;

    filter(fn: (element: PageElement, index?: number) => boolean): PageElementList;

    forEach(fn: (element: PageElement, index?: number) => Promise<void> | void): Promise<void>;
}
