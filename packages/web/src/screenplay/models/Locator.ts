import { PageElement } from './PageElement';
import { Selector } from './selectors';

export abstract class Locator<Native_Element_Type, Native_Root_Element_Type = any, Selector_Type extends Selector = Selector> {
    constructor(
        protected readonly parentRoot: () => Promise<Native_Root_Element_Type> | Native_Root_Element_Type,
        protected readonly selector: Selector_Type,
        protected readonly locateElement: (root: Native_Root_Element_Type) => Promise<Native_Element_Type> | Native_Element_Type,
        protected readonly locateAllElements: (root: Native_Root_Element_Type) => Promise<Array<Native_Element_Type>> | Array<Native_Element_Type>,
    ) {
    }

    public async nativeElement(): Promise<Native_Element_Type> {
        return this.locateElement(await this.parentRoot());
    }

    abstract of(parent: Locator<Native_Element_Type, Native_Root_Element_Type>): Locator<Native_Element_Type, Native_Root_Element_Type>;

    abstract element(): PageElement<Native_Element_Type>;
    abstract allElements(): Promise<Array<PageElement<Native_Element_Type>>>;

    toString(): string {
        return this.selector.toString();
    }
}
