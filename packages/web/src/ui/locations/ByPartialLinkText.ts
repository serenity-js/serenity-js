import { UIElementLocation } from './UIElementLocation';

export class ByPartialLinkText extends UIElementLocation {
    constructor(value: string) {
        super(`by partial link text "${ value }"`, value);
    }
}
