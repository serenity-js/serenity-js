import { UIElementLocation } from '../locations';
import { UIElement } from './UIElement';

export interface UIElementList {
    location(): UIElementLocation;

    count(): Promise<number>;
    first(): UIElement;
    last(): UIElement;
    get(index: number): UIElement;

    map<O>(fn: (element: UIElement, index?: number, elements?: UIElementList) => Promise<O> | O): Promise<O[]>;

    filter(fn: (element: UIElement, index?: number) => boolean): UIElementList;

    forEach(fn: (element: UIElement, index?: number) => Promise<void> | void): Promise<void>;
}
