import { ElementLocation } from './ElementLocation';

export class ById extends ElementLocation {
    constructor(value: string) {
        super(`by id #${ value }`, value);
    }
}
