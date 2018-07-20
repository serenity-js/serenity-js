import { TinyType } from 'tiny-types';

import { Name } from '../domain';
import { FileType } from './FileType';

export class Artifact<T> extends TinyType {
    constructor(
        public readonly name: Name,
        public readonly type: FileType,
        public readonly contents: T,
    ) {
        super();
    }
}
