import { PageElementLocation } from './PageElementLocation';

export class ByCss extends PageElementLocation {
    constructor(value: string) {
        super(`by css "${ value }"`, value);
    }
}
