import { ElementLocation } from './ElementLocation';

export class ByCss extends ElementLocation {
    constructor(value: string) {
        super(`by css "${ value }"`, value);
    }
}
