import { TinyType } from 'tiny-types';
import { Path } from './Path';

export class FileSystemLocation extends TinyType {
    constructor(
        public readonly path: Path,
        public readonly line?: number,
        public readonly column?: number,
    ) {
        super();
    }
}
