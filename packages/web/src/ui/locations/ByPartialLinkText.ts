import { ElementLocation } from './ElementLocation';

export class ByPartialLinkText extends ElementLocation {
    constructor(value: string) {
        super(`by partial link text "${ value }"`, value);
    }
}
