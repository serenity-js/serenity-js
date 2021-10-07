import { ElementLocation } from './ElementLocation';

export class ByLinkText extends ElementLocation {
    constructor(value: string) {
        super(`by link text "${ value }"`, value);
    }
}
