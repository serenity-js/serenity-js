import { PageElement } from './PageElement';
import { Selector } from './selectors';

// todo: remove Native_Selector_Type once Native_Root_Element_Type is an interface
export abstract class Locator<Native_Element_Type, Native_Root_Element_Type = any, Native_Selector_Type = any> {
    constructor(
        protected readonly parentRoot: () => Promise<Native_Root_Element_Type> | Native_Root_Element_Type,
        protected readonly selector: Selector,
    ) {
    }

    protected abstract nativeSelector(): Native_Selector_Type;
    public abstract nativeElement(): Promise<Native_Element_Type>;
    protected abstract allNativeElements(): Promise<Array<Native_Element_Type>>;

    abstract of(parent: Locator<Native_Element_Type, Native_Root_Element_Type>): Locator<Native_Element_Type, Native_Root_Element_Type>;
    abstract locate(child: Locator<Native_Element_Type, Native_Root_Element_Type>): Locator<Native_Element_Type, Native_Root_Element_Type>;

    // todo: remove?
    abstract element(): PageElement<Native_Element_Type>;

    // todo: remove?
    abstract allElements(): Promise<Array<PageElement<Native_Element_Type>>>;

    toString(): string {
        return this.selector.toString();
    }
}
