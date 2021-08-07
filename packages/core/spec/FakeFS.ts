import fs = require('fs');
import path = require('upath');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createFsFromVolume, Volume } = require('memfs'); // Typings incorrectly assume the presence of "dom" lib

export interface DirectoryStructure {
    [ key: string ]: DirectoryStructure | string;
}

export class FakeFS {
    public static readonly Empty_Directory = {};

    static with(tree: DirectoryStructure, cwd = process.cwd()): typeof fs {

        function flatten(
            currentStructure: DirectoryStructure | string,
            currentPath = '',
        ): { [key: string]: string } {

            if (typeof currentStructure === 'string') {
                return ({
                    [ currentPath ]: currentStructure,
                });
            }

            const entries = Object.keys(currentStructure);

            if (entries.length === 0) {
                return ({
                    [ currentPath ]: void 0,
                });
            }

            return Object.keys(currentStructure).reduce((acc, key) =>  {
                return ({
                    ...acc,
                    ...flatten(currentStructure[key], path.join(currentPath, key)),
                });
            }, {});
        }

        return createFsFromVolume(Volume.fromJSON(flatten(tree), cwd)) as typeof fs;
    }
}
