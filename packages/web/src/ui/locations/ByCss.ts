import { UIElementLocation } from './UIElementLocation';

export class ByCss extends UIElementLocation {
    constructor(value: string) {
        super(`by css "${ value }"`, value);
    }
}
