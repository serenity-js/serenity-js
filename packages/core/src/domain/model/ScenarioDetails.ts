import { TinyType } from 'tiny-types';

import { FileSystemLocation } from '../../io';
import { Category } from './Category';
import { Name } from './Name';

export class ScenarioDetails extends TinyType {

    constructor(
        public readonly name: Name,
        public readonly category: Category,
        public readonly location: FileSystemLocation,
    ) {
        super();
    }
}
