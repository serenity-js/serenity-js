import { PageElementLocation } from '../locations';
import { PageElementList } from './PageElementList';

export interface PageElement {
    nativeElement(): any

    location(): PageElementLocation;
    locateChildElement(locator: PageElementLocation): Promise<PageElement>;
    locateAllChildElements(locator: PageElementLocation): Promise<PageElementList>;

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
