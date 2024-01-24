import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import type { JSONObject } from 'tiny-types';

import { FileSystem, Path, SpecDirectory } from '../../src/io';
import { expect } from '../expect';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { memfs } = require('memfs'); // Typings incorrectly assume the presence of "dom" lib

describe('SerenityBDDReporter', () => {

    const cwd = Path.from(process.cwd());

    describe('factory method', () => {

        given([
            `features`,
            `spec`,
            `tests`,
            `test`,
            `src`,
        ]).
        it('auto-detects the spec directory ', (specDirectory) => {
            const guessedSpecDirectory = new SpecDirectory(
                fileSystem({ '/home/alice/my-project': { [`${ specDirectory }`]: {} } })
            ).guessLocation();

            expect(guessedSpecDirectory).to.equal(cwd.resolve(Path.from(`/home/alice/my-project/${ specDirectory }`)));
        })

        it('defaults to the current working directory when no custom specDirectory is provided', () => {
            const guessedSpecDirectory = new SpecDirectory(
                fileSystem({ '/home/alice/my-project': { } })
            ).guessLocation();

            expect(guessedSpecDirectory).to.equal(cwd.resolve(Path.from(`/home/alice/my-project`)));
        });
    });
});

function fileSystem(fakeDirectoryStructure: JSONObject) {
    const cwd = Path.from(Object.keys(fakeDirectoryStructure)[0]);
    return new FileSystem(cwd, memfs(fakeDirectoryStructure).fs)
}
