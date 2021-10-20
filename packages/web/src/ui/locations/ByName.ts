import { PageElementLocation } from './PageElementLocation';

export class ByName extends PageElementLocation {
    constructor(value: string) {
        super(`by name "${ value }"`, value);
    }
}
