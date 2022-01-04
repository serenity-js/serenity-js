import { Selector } from './Selector';

export class ByCss extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}
