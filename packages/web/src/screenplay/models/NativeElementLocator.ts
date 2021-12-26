import { Selector } from './selectors';

export interface NativeElementLocator<Native_Element_Type> {
    locate<Parameters extends unknown[]>(selector: Selector<Parameters>): Promise<Native_Element_Type>;
    locateAll<Parameters extends unknown[]>(selector: Selector<Parameters>): Promise<Native_Element_Type[]>;
}
