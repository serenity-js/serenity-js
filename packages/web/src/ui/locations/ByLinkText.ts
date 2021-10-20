import { PageElementLocation } from './PageElementLocation';

export class ByLinkText extends PageElementLocation {
    constructor(value: string) {
        super(`by link text "${ value }"`, value);
    }
}
