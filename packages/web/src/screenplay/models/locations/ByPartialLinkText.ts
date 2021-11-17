import { PageElementLocation } from './PageElementLocation';

export class ByPartialLinkText extends PageElementLocation {
    constructor(value: string) {
        super(`by partial link text "${ value }"`, value);
    }
}
