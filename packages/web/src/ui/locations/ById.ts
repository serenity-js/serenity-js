import { PageElementLocation } from './PageElementLocation';

export class ById extends PageElementLocation {
    constructor(value: string) {
        super(`by id #${ value }`, value);
    }
}
