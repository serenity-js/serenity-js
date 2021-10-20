import { PageElementLocation } from './PageElementLocation';

export class ByTagName extends PageElementLocation {
    constructor(value: string) {
        super(`by tag name <${ value } />`, value);
    }
}
