import { UIElementLocation } from './UIElementLocation';

export class ByCssContainingText extends UIElementLocation {
    constructor(value: string, public readonly text: string) {
        super(`by css "${ value }" containing text "${ text }"`, value);
    }
}
