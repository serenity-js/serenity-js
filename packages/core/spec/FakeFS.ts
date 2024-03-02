import type * as fs from 'node:fs';

import type { NestedDirectoryJSON} from 'memfs';
import { createFsFromVolume, Volume } from 'memfs';

export class FakeFS {
    public static readonly Empty_Directory = {};

    static with(tree: NestedDirectoryJSON, cwd = process.cwd()): typeof fs {
        return createFsFromVolume(Volume.fromNestedJSON(tree, cwd)) as unknown as typeof fs;
    }
}
