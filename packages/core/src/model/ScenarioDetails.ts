import { Serialised, TinyType } from 'tiny-types';

import { FileSystemLocation } from '../io';
import { Category } from './Category';
import { Name } from './Name';

export class ScenarioDetails extends TinyType {
    static fromJSON(o: Serialised<ScenarioDetails>) {
        return new ScenarioDetails(
            Name.fromJSON(o.name as string),
            Category.fromJSON(o.category as string),
            FileSystemLocation.fromJSON(o.location as Serialised<FileSystemLocation>),
        );
    }

    constructor(
        public readonly name: Name,
        public readonly category: Category,
        public readonly location: FileSystemLocation,
    ) {
        super();
    }
}
