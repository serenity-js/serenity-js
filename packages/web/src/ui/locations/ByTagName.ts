import { ElementLocation } from './ElementLocation';

export class ByTagName extends ElementLocation {
    constructor(value: string) {
        super(`by tag name <${ value } />`, value);
    }
}
