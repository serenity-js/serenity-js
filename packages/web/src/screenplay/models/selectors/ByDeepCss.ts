import { Selector } from './Selector';

export class ByDeepCss extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}
