import { UIElementLocation } from './UIElementLocation';

export class ById extends UIElementLocation {
    constructor(value: string) {
        super(`by id #${ value }`, value);
    }
}
