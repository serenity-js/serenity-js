import { ElementLocation } from './ElementLocation';

export class ByXPath extends ElementLocation {
    constructor(value: string) {
        super(`by XPath ${ value }`, value);
    }
}
