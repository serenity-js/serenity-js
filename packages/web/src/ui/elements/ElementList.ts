import { ElementLocation } from '../locations';
import { Element } from './Element';

export interface ElementList {
    location(): ElementLocation;

    count(): Promise<number>;
    first(): Element;
    last(): Element;
    get(index: number): Element;

    map<O>(fn: (element: Element, index?: number, elements?: ElementList) => Promise<O> | O): Promise<O[]>;

    filter(fn: (element: Element, index?: number) => boolean): ElementList;

    forEach(fn: (element: Element, index?: number) => Promise<void> | void): Promise<void>;
}
