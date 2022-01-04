import { Selector } from './Selector';

export class ById extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}
