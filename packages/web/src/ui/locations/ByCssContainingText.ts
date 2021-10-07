import { ElementLocation } from './ElementLocation';

export class ByCssContainingText extends ElementLocation {
    constructor(value: string, public readonly text: string) {
        super(`by css "${ value }" containing text "${ text }"`, value);
    }
}
