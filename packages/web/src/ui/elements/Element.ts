import { ElementLocation } from '../locations';
import { ElementList } from './ElementList';

export interface Element {
    nativeElement(): any

    location(): ElementLocation;
    locateChildElement(locator: ElementLocation): Promise<Element>;
    locateAllChildElements(locator: ElementLocation): Promise<ElementList>;

    enterValue(value: string | number | Array<string | number>): Promise<void>;
    clearValue(): Promise<void>;
    click(): Promise<void>;
    doubleClick(): Promise<void>;
    scrollIntoView(): Promise<void>;
    hoverOver(): Promise<void>;
    rightClick(): Promise<void>;    // todo: should this be a click() call with a parameter?

    getAttribute(name): Promise<string>;
    getText(): Promise<string>;
    getValue(): Promise<string>;

    isActive(): Promise<boolean>;
    isClickable(): Promise<boolean>;
    isDisplayed(): Promise<boolean>;
    isEnabled(): Promise<boolean>;
    isPresent(): Promise<boolean>;
    isSelected(): Promise<boolean>;

    toString(): string;
}
