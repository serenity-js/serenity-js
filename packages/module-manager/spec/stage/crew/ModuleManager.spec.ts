import { EventRecorder, EventStreamEmitter, expect, PickEvent } from '@integration/testing-tools';
import { Cast, Clock, Duration, ErrorFactory, Stage, StageManager, Timestamp } from '@serenity-js/core';
import { SerenityInstallationDetected } from '@serenity-js/core/lib/events/index.js';
import { FileSystem, ModuleLoader, Path, Version } from '@serenity-js/core/lib/io/index.js';
import { createAxios } from '@serenity-js/rest';
import type { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import type * as nodeFS from 'fs';
import { patchRequire } from 'fs-monkey';
import type { NestedDirectoryJSON } from 'memfs';
import { createFsFromVolume, Volume } from 'memfs';
import { describe, it } from 'mocha';

import type { ModuleManagerConfig } from '../../../src/index.js';
import { ModuleManager } from '../../../src/index.js';
import { Presets } from '../../../src/io/presets/index.js';
import { PresetDownloader } from '../../../src/io/presets/PresetDownloader.js';
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

                it('retrieves the latest versions of the Serenity/JS modules and updates the cache', async () => {

                    const clock =  new Clock();

                    const { emitter, recorder, stage, mockAxios, fileSystem, fs } = createTestEnvironment({
                        projectDirectory: {
                            [ ModuleManager.defaultCacheDirectory ]: {
                                'module-manager.json': stubs.getAsJson('module-manager', {
                                    packages: { '@serenity-js-example/framework': '1.0.0' },
                                    caching: { enabled: true, duration: Duration.ofHours(1).inMilliseconds() }
                                })
                            },
                            ...fakeNodeModule('@serenity-js-example/framework', '1.0.0'),
                        },
                        clock,
                    });

                    const aWeekAgo = clock.now().less(Duration.ofDays(7)).toSeconds();
                    fs.utimesSync(Path.from(ModuleManager.defaultCacheDirectory, 'module-manager.json').value, aWeekAgo, aWeekAgo);

                    mockAxios.onGet('https://example.org/presets/v1/module-manager.json')
                        .reply(200, stubs.getAsJson('module-manager', { packages: { '@serenity-js-example/framework': '1.1.0' }}), {
                            'Content-Type': 'application/json',
                        });

                    await stage.waitForNextCue();

                    await emitter.emit(`
                        {"type":"TestRunStarts","event":"${ clock.now().toISOString() }"}
                    `);

                    PickEvent.from(recorder.events)
                        .next(SerenityInstallationDetected, (event: SerenityInstallationDetected) => {
                            expect(event.details.packages.get('@serenity-js-example/framework')).to.equal(new Version('1.0.0'));
                            expect(event.details.integrations.size).to.equal(0);
                            expect(event.details.updates.size).to.equal(1);
                            expect(event.details.updates.get('@serenity-js-example/framework')).to.equal(new Version('1.1.0'));
                        });

                    const stats = await fileSystem.stat(Path.from(ModuleManager.defaultCacheDirectory, 'module-manager.json'))

                    const createdAt = Timestamp.fromJSON(stats.mtime.toISOString());
                    expect(clock.now().diff(createdAt).isLessThan(Duration.ofMinutes(1))).to.equal(true);
                });
            });
        });

        describe('and Serenity/JS module-manager.json is not cached', () => {

            it('retrieves the latest versions of the Serenity/JS modules and the caches it', async () => {

                const clock =  new Clock();

                const { emitter, recorder, stage, mockAxios, fileSystem } = createTestEnvironment({
                    projectDirectory: {
                        ...fakeNodeModule('@serenity-js-example/framework', '1.0.0'),
                    },
                    clock,
                });

                mockAxios.onGet('https://example.org/presets/v1/module-manager.json')
                    .reply(200, stubs.getAsJson('module-manager', { packages: { '@serenity-js-example/framework': '1.1.0' }}), {
                        'Content-Type': 'application/json',
                    });

                await stage.waitForNextCue();

                await emitter.emit(`
                        {"type":"TestRunStarts","event":"${ clock.now().toISOString() }"}
                    `);

                PickEvent.from(recorder.events)
                    .next(SerenityInstallationDetected, (event: SerenityInstallationDetected) => {
                        expect(event.details.packages.get('@serenity-js-example/framework')).to.equal(new Version('1.0.0'));
                        expect(event.details.integrations.size).to.equal(0);
                        expect(event.details.updates.size).to.equal(1);
                        expect(event.details.updates.get('@serenity-js-example/framework')).to.equal(new Version('1.1.0'));
                    });

                const stats = await fileSystem.stat(Path.from(ModuleManager.defaultCacheDirectory, 'module-manager.json'))

                const createdAt = Timestamp.fromJSON(stats.mtime.toISOString());
                expect(clock.now().diff(createdAt).isLessThan(Duration.ofMinutes(1))).to.equal(true);
            });
        });
    });
});

function createTestEnvironment({ config, projectDirectory, cwd = Path.from(process.cwd()), clock = new Clock() } : { config?: ModuleManagerConfig, cwd?: Path, clock?: Clock, projectDirectory: NestedDirectoryJSON }): {
    emitter: EventStreamEmitter,
    fileSystem: FileSystem,
    fs: typeof nodeFS,
    manager: ModuleManager,
    mockAxios: MockAdapter,
    recorder: EventRecorder,
    stage: Stage,
} {
    const interactionTimeout = Duration.ofSeconds(5);

    const stage = new Stage(
        Cast.where(actor => actor),
        new StageManager(
            Duration.ofMilliseconds(5000),
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

    const fs = createFsFromVolume(volume) as unknown as typeof nodeFS;
    const fileSystem = new FileSystem(cwd, fs);

    const moduleLoader = new ModuleLoader(cwd.value, false);

    const axios = createAxios({ baseURL: 'https://example.org/presets/v1/' });
    const mockAxios = new MockAdapter(axios);

    const manager = new ModuleManager(
        moduleLoader,
        new Presets(
            fileSystem,
            new PresetDownloader(axios as AxiosInstance),
            Path.from(ModuleManager.defaultCacheDirectory)
        ),
        stage,
    );

    stage.assign(recorder);
    stage.assign(manager);

    return {
        emitter,
        fileSystem,
        fs,
        manager,
        mockAxios,
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
