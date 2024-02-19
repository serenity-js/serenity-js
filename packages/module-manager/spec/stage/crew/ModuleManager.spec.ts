import { EventRecorder, EventStreamEmitter, expect, PickEvent } from '@integration/testing-tools';
import { Cast, Clock, Duration, ErrorFactory, Stage, StageManager } from '@serenity-js/core';
import { SerenityInstallationDetected } from '@serenity-js/core/lib/events/index.js';
import { FileSystem, ModuleLoader, Path, Version } from '@serenity-js/core/lib/io/index.js';
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
                            [ ModuleManager.defaultCacheDirectory ]: {
                                'module-manager.json': stubs.getAsJson('module-manager', { packages: { '@serenity-js-example/framework': '1.0.0' }})
                            },
                            ...fakeNodeModule('@serenity-js-example/framework', '1.0.0', { '@example/library': '^2.3.0' }),
                            ...fakeNodeModule('@serenity-js-example/third-party-library', '2.3.5'),
                        }
                    });

                    await stage.waitForNextCue();

                    await emitter.emit(`
                        {"type":"TestRunStarts","event":"2024-02-10T10:47:58.480Z"}
                    `);

                    PickEvent.from(recorder.events)
                        .next(SerenityInstallationDetected, (event: SerenityInstallationDetected) => {
                            expect(event.details.packages.get('@serenity-js-example/framework')).to.equal(new Version('1.0.0'));
                            expect(event.details.integrations.get('@serenity-js-example/third-party-library')).to.equal(new Version('2.3.5'));
                            expect(event.details.updates.size).to.equal(0);
                        });
                });

                it('lists available updates', async () => {

                    const { emitter, recorder, stage } = createTestEnvironment({
                        projectDirectory: {
                            [ ModuleManager.defaultCacheDirectory ]: {
                                'module-manager.json': stubs.getAsJson('module-manager', { packages: { '@serenity-js-example/framework': '1.1.0' }})
                            },
                            ...fakeNodeModule('@serenity-js-example/framework', '1.0.0'),
                        }
                    });

                    await stage.waitForNextCue();

                    await emitter.emit(`
                        {"type":"TestRunStarts","event":"2024-02-10T10:47:58.480Z"}
                    `);

                    PickEvent.from(recorder.events)
                        .next(SerenityInstallationDetected, (event: SerenityInstallationDetected) => {
                            expect(event.details.packages.get('@serenity-js-example/framework')).to.equal(new Version('1.0.0'));
                            expect(event.details.integrations.size).to.equal(0);
                            expect(event.details.updates.size).to.equal(1);
                            expect(event.details.updates.get('@serenity-js-example/framework')).to.equal(new Version('1.1.0'));
                        });
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

    const fileSystem = new FileSystem(cwd, createFsFromVolume(volume) as unknown as typeof nodeFS);

    const moduleLoader = new ModuleLoader(cwd.value, false);

    const manager = new ModuleManager(
        moduleLoader,
        fileSystem,
        stage,
    );

    stage.assign(recorder);
    stage.assign(manager);

    return {
        manager,
        emitter,
        recorder,
        stage,
    };
}

function fakeNodeModule(moduleId: string, version: string, dependencies: Record<string, string> = {}): NestedDirectoryJSON {
    return {
        [`node_modules/${ moduleId }`]: {
            'package.json': `{"name":"${ moduleId }","version":"${ version }","main":"index.js","dependencies":${ JSON.stringify(dependencies, undefined, 0) }}`,
            'index.js': 'module.exports = {}'
        }
    }
}
