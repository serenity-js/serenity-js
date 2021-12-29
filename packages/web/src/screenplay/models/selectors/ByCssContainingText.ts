import { Selector } from './Selector';

export class ByCssContainingText extends Selector<string> {
    constructor(selector: string, public readonly text: string) {
        super(selector);
    }
}
