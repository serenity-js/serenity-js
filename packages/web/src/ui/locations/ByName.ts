import { ElementLocation } from './ElementLocation';

export class ByName extends ElementLocation {
    constructor(value: string) {
        super(`by name "${ value }"`, value);
    }
}
