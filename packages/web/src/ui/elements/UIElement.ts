import { UIElementLocation } from '../locations';
import { UIElementList } from './UIElementList';

// todo: should this be generic? UIElement<Element<'async'>> ?
export interface UIElement {
    nativeElement(): any

    location(): UIElementLocation;
    locateChildElement(locator: UIElementLocation): Promise<UIElement>;
    locateAllChildElements(locator: UIElementLocation): Promise<UIElementList>;

    enterValue(value: string | number | Array<string | number>): Promise<void>;
    clearValue(): Promise<void>;
    click(): Promise<void>;
    doubleClick(): Promise<void>;
    moveTo(): Promise<void>;
    rightClick(): Promise<void>;    // todo: should this be a click() call with a parameter?

    getAttribute(name): Promise<string>;
    getText(): Promise<string>;
    getValue(): Promise<string>;

    isActive(): Promise<boolean>;
    isClickable(): Promise<boolean>;
    isEnabled(): Promise<boolean>;
    isPresent(): Promise<boolean>;
    isSelected(): Promise<boolean>;
    isVisible(): Promise<boolean>;

    toString(): string;
}
