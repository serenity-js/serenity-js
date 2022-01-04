import { Selector } from './Selector';

export class ByTagName extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}
