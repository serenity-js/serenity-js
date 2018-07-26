import { Serialised, TinyType } from 'tiny-types';

import { Name } from '../model';
import { FileType } from './FileType';

export class Artifact<T> extends TinyType {
    static fromJSON = <E>(o: Serialised<Artifact<E>>) => new Artifact<E>(
        Name.fromJSON(o.name as string),
        FileType.fromJSON(o.type as Serialised<FileType>),
        (o as any).contents,
    )

    constructor(
        public readonly name: Name,
        public readonly type: FileType,
        public readonly contents: T,
    ) {
        super();
    }
}
