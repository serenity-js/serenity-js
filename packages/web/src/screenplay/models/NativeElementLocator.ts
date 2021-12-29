import { Selector } from './selectors';

export interface NativeElementLocator<Native_Element_Type> {
    locate<T>(selector: Selector<T>): Promise<Native_Element_Type>;
    locateAll<T>(selector: Selector<T>): Promise<Native_Element_Type[]>;
}
