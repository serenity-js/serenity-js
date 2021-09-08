import { UIElementLocation } from './UIElementLocation';

export class ByName extends UIElementLocation {
    constructor(value: string) {
        super(`by name "${ value }"`, value);
    }
}
