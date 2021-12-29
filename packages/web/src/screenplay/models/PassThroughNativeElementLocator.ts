import { NativeElementLocator } from './NativeElementLocator';
import { Selector } from './selectors';

export class PassThroughNativeElementLocator<Native_Element_Type = any> implements NativeElementLocator<Native_Element_Type> {
    constructor(
        private readonly locator: NativeElementLocator<Native_Element_Type>,
        private readonly element: Native_Element_Type
    ) {
    }

    async locate<T>(selector: Selector<T>): Promise<Native_Element_Type> {
        return this.element;
    }

    locateAll<T>(selector: Selector<T>): Promise<Native_Element_Type[]> {
        return this.locator.locateAll(selector);
    }
}
