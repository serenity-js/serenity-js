import { UIElementLocation } from './UIElementLocation';

export class ByLinkText extends UIElementLocation {
    constructor(value: string) {
        super(`by link text "${ value }"`, value);
    }
}
