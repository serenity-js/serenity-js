import { PageElementLocation } from './PageElementLocation';

export class ByCssContainingText extends PageElementLocation {
    constructor(value: string, public readonly text: string) {
        super(`by css "${ value }" containing text "${ text }"`, value);
    }
}
