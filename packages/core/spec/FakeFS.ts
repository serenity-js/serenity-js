import fs = require('fs');
import path = require('upath');
const { createFsFromVolume, Volume } = require('memfs'); // tslint:disable-line:no-var-requires Typings incorrectly assume the presence of "dom" lib

export interface DirectoryStructure {
    [ key: string ]: DirectoryStructure | string;
}

export class FakeFS {
    public static readonly Empty_Directory = {};

    static with(tree: DirectoryStructure, cwd = process.cwd()): typeof fs {

        function flatten(
            currentStructure: DirectoryStructure | string,
            currentPath: string = '',
        ): { [key: string]: string } {

            if (typeof currentStructure === 'string') {
                return ({
                    [ currentPath ]: currentStructure,
                });
            }

            const entries = Object.keys(currentStructure);

            if (! entries.length) {
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
