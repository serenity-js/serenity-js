import { expect } from '@integration/testing-tools';
import { Stage } from '@serenity-js/core';
import { FileSystem, Path } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';
import { createStubInstance } from 'sinon';
import type { JSONObject } from 'tiny-types';

import { SerenityBDDReporter } from '../src';

const { memfs } = require('memfs'); // Typings incorrectly assume the presence of "dom" lib

describe('SerenityBDDReporter', () => {

    const stage = createStubInstance(Stage);

    describe('factory method', () => {

        it('instantiates the reporter based on provided configuration', () => {
            const reporter = SerenityBDDReporter.fromJSON({ specDirectory: 'features' }).build({
                stage,
                fileSystem: fileSystem({ '/home/alice/my-project': { 'features': {} } }),
                outputStream: undefined,
            });
            expect(reporter.assignedTo).to.be.a('function');
        });
    });
});

function fileSystem(fakeDirectoryStructure: JSONObject) {
    const cwd = Path.from(Object.keys(fakeDirectoryStructure)[0]);
    return new FileSystem(cwd, memfs(fakeDirectoryStructure).fs)
}
