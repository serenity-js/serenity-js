import { EventRecorder, EventStreamEmitter, expect, PickEvent } from '@integration/testing-tools';
import { Cast, Clock, Duration, ErrorFactory, Stage, StageManager } from '@serenity-js/core';
import { SerenityInstallationDetected } from '@serenity-js/core/lib/events/index.js';
import { FileSystem, Path, Version } from '@serenity-js/core/lib/io/index.js';
import type * as nodeFS from 'fs';
import { patchRequire } from 'fs-monkey';
import type { NestedDirectoryJSON } from 'memfs';
import { createFsFromVolume, Volume } from 'memfs';
import { describe, it } from 'mocha';

import type { ModuleManagerConfig } from '../../../src/index.js';
import { ModuleManager } from '../../../src/index.js';
import { Stubs } from '../../Stubs.js';

describe('ModuleManager', () => {

    const stubs = Stubs.from('stage/crew/stubs');

    describe('when the test run starts', () => {

        describe('and Serenity/JS module-manager.json is cached', () => {

            describe('and the cache has not expired yet', () => {

                it(`offers no updates when Serenity/JS modules are up to date`, async () => {

                    const { emitter, recorder, stage } = createTestEnvironment({
                        projectDirectory: {
                            [ModuleManager.defaultCacheDirectory]: {
                                'module-manager.json': stubs.getAsJson('module-manager', { packages: { '@serenity-js/example': '1.0.0' }})
                            },
                            'node_modules/@serenity-js/example': {
                                'package.json': '{"name":"@serenity-js/example","version":"1.0.0","main":"index.js","dependencies":{"@example/library":"^2.3.0"}}',
                                'index.js': 'module.exports = {}'
                            },
                            'node_modules/@example/library': {
                                'package.json': '{"name":"@example/library","version":"2.3.5","main":"index.js"}',
                                'index.js': 'module.exports = {}'
                            },
                        }
                    });

                    await stage.waitForNextCue();

                    await emitter.emit(`
                        {"type":"TestRunStarts","event":"2024-02-10T10:47:58.480Z"}
                    `);

                    PickEvent.from(recorder.events)
                        .next(SerenityInstallationDetected, (event: SerenityInstallationDetected) => {
                            expect(event.details.packages.get('@serenity-js/example')).to.equal(new Version('1.0.0'));
                            expect(event.details.integrations.get('@example/library')).to.equal(new Version('2.3.5'));
                            expect(event.details.updates.size).to.equal(0);
                        })
                });

                it('notifies the developer when updates are available', async () => {
                });
            });

            describe('and the cache has expired', () => {

            });
        });

        describe('and Serenity/JS module-manager.json is not cached', () => {

        });
    });
});

function createTestEnvironment({ config, cwd = Path.from(process.cwd()), projectDirectory } : { config?: ModuleManagerConfig, cwd?: Path, projectDirectory: NestedDirectoryJSON }): {
    manager: ModuleManager,
    emitter: EventStreamEmitter,
    recorder: EventRecorder,
    stage: Stage,
} {
    const clock = new Clock();
    const interactionTimeout = Duration.ofSeconds(5);

    const stage = new Stage(
        Cast.where(actor => actor),
        new StageManager(
            Duration.ofMilliseconds(250),
            clock,
        ),
        new ErrorFactory(),
        clock,
        interactionTimeout,
    );

    const emitter  = new EventStreamEmitter(stage);
    const recorder = new EventRecorder();

    const volume = Volume.fromNestedJSON(projectDirectory, cwd.value);

    patchRequire(volume, true);

    const manager = ModuleManager.fromJSON(config).build({
        stage,
        fileSystem: new FileSystem(cwd, createFsFromVolume(volume) as unknown as typeof nodeFS),
        outputStream: undefined,    // Module Manager doesn't use the output stream, so we don't need it
    });

    stage.assign(recorder);
    stage.assign(manager);

    return {
        manager,
        emitter,
        recorder,
        stage,
    };
}
