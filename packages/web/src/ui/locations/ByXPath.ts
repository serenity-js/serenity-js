import { UIElementLocation } from './UIElementLocation';

export class ByXPath extends UIElementLocation {
    constructor(value: string) {
        super(`by XPath ${ value }`, value);
    }
}
