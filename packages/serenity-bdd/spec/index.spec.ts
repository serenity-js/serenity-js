import { expect } from '@integration/testing-tools';
import { Stage } from '@serenity-js/core';
import { FileSystem, Path } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import { createStubInstance } from 'sinon';
import type { JSONObject } from 'tiny-types';

import SerenityBDDReporter from '../src';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { memfs } = require('memfs'); // Typings incorrectly assume the presence of "dom" lib

describe('SerenityBDDReporter', () => {

    const stage = createStubInstance(Stage);
    const cwd = Path.from(process.cwd());

    it('offers a default builder', () => {
        const reporter = SerenityBDDReporter({ specDirectory: 'features' }).build({
            stage,
            fileSystem: fileSystem({ '/home/alice/my-project': { 'features': {} } }),
            outputStream: undefined,
        });
        expect(reporter.assignedTo).to.be.a('function');
    });

    describe('default builder', () => {

        given([
            `features`,
            `spec`,
            `tests`,
            `test`,
            `src`,
        ]).
        it('auto-detects the spec directory ', (specDirectory) => {
            const reporter = SerenityBDDReporter({ specDirectory: specDirectory }).build({
                stage,
                fileSystem: fileSystem({ '/home/alice/my-project': { [`${ specDirectory }`]: {} } }),
                outputStream: undefined,
            });

            expect((reporter as any).specDirectory).to.equal(cwd.resolve(Path.from(`/home/alice/my-project/${ specDirectory }`)));
        })

        it('can be configured to use a custom spec directory, as long as it exists', () => {
            const specDirectory = 'e2e';
            const reporter = SerenityBDDReporter({ specDirectory }).build({
                stage,
                fileSystem: fileSystem({ '/home/alice/my-project': { [`${ specDirectory }`]: {} } }),
                outputStream: undefined,
            });

            expect((reporter as any).specDirectory).to.equal(cwd.resolve(Path.from(`/home/alice/my-project/${ specDirectory }`)));
        });

        it('complains if the custom spec directory does not exist', () => {
            const specDirectory = 'e2e';

            expect(() =>
                SerenityBDDReporter({ specDirectory }).build({
                    stage,
                    fileSystem: fileSystem({ '/home/alice/my-project': {} }),
                    outputStream: undefined,
                })
            ).to.throw(`Configured specDirectory \`${ specDirectory }\` does not exist`);
        });

        it('defaults to the current working directory when no custom specDirectory is provided', () => {
            const specDirectory = undefined;
            const reporter = SerenityBDDReporter({ specDirectory }).build({
                stage,
                fileSystem: fileSystem({ '/home/alice/my-project': { } }),
                outputStream: undefined,
            });

            expect((reporter as any).specDirectory).to.equal(cwd.resolve(Path.from(`/home/alice/my-project`)));
        });
    });
});

function fileSystem(fakeDirectoryStructure: JSONObject) {
    const cwd = Path.from(Object.keys(fakeDirectoryStructure)[0]);
    return new FileSystem(cwd, memfs(fakeDirectoryStructure).fs)
}
