import { Selector } from './Selector';

export class ByXPath extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}
