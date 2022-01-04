import { Selector } from './Selector';

export class ByCssContainingText extends Selector {
    constructor(public readonly value: string, public readonly text: string) {
        super();
    }
}
