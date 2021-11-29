import { PageElementLocation } from './PageElementLocation';

export class ByXPath extends PageElementLocation {
    constructor(value: string) {
        super(`by XPath ${ value }`, value);
    }
}
