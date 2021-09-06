import { UIElementLocation } from './UIElementLocation';

export class ByTagName extends UIElementLocation {
    constructor(value: string) {
        super(`by tag name <${ value } />`, value);
    }
}
