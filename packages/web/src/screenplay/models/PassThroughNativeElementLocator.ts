import { NativeElementLocator } from './NativeElementLocator';
import { Selector } from './selectors';

export class PassThroughNativeElementLocator<Native_Element_Type = any> implements NativeElementLocator<Native_Element_Type> {
    constructor(
        private readonly locator: NativeElementLocator<Native_Element_Type>,
        private readonly element: Native_Element_Type
    ) {
    }

    async locate<Parameters extends unknown[]>(selector: Selector<Parameters>): Promise<Native_Element_Type> {
        return this.element;
    }

    locateAll<Parameters extends unknown[]>(selector: Selector<Parameters>): Promise<Native_Element_Type[]> {
        return this.locator.locateAll(selector);
    }
}
