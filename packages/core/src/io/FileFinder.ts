import { sync as fg } from 'fast-glob';
import { Path } from './Path';

export class FileFinder {
    constructor(private readonly cwd: Path) {
    }

    filesMatching(globPatterns: string[] | string | undefined): Path[] {
        if (! globPatterns) {
            return [];
        }

        return fg<string>(globPatterns, {
            cwd: this.cwd.value,
            absolute: true,
            unique: true,
        }).map(value => new Path(value));
    }
}
