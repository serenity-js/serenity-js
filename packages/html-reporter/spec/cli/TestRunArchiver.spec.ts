import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { FileSystem, Path } from '@serenity-js/core/io';
import { createFsFromVolume, Volume } from 'memfs';

import { ArtifactWriter } from '../../src/cli/ArtifactWriter.js';
import type { RunData } from '../../src/cli/model/RunData.js';
import { RunDataWriter } from '../../src/cli/RunDataWriter.js';

test.describe('ArtifactWriter', () => {

    function createWriter(outputDirectory = Path.from('/output')): { writer: ArtifactWriter; filesystem: typeof fs } {
        const filesystem = createFsFromVolume(Volume.fromNestedJSON({ [outputDirectory.value]: {} }, '/')) as unknown as typeof fs;
        const fileSystem = new FileSystem(outputDirectory, filesystem);
        const writer = new ArtifactWriter(fileSystem);
        return { writer, filesystem };
    }

    test.describe('CI directory naming: test-runs/{buildId}/{moduleId}-{attempt}', () => {

        test('places the run directory under test-runs/{buildId}/ when testRunId and moduleId are provided', () => {
            const { writer } = createWriter();

            writer.createRunDirectory('42', 1, 'html-reporter');

            const directory = writer.getRunDirectory().value;
            expect(directory).toMatch(/test-runs\/42\/html-reporter-1$/);
        });

        test('uses attempt number in the subdirectory name', () => {
            const { writer } = createWriter();

            writer.createRunDirectory('42', 3, 'playwright-test');

            const directory = writer.getRunDirectory().value;
            expect(directory).toMatch(/test-runs\/42\/playwright-test-3$/);
        });

        test('sanitises moduleId for use in a directory name', () => {
            const { writer } = createWriter();

            writer.createRunDirectory('100', 1, 'webdriverio-8-web');

            const directory = writer.getRunDirectory().value;
            expect(directory).toMatch(/test-runs\/100\/webdriverio-8-web-1$/);
        });
    });

    test.describe('local directory naming: test-runs/{timestamp}', () => {

        test('uses a timestamp-based top-level directory when no testRunId is provided', () => {
            const { writer } = createWriter();

            writer.createRunDirectory(undefined, 1, undefined);

            const directory = writer.getRunDirectory().value;
            // Must be directly under test-runs/ with a filesystem-safe timestamp
            expect(directory).toMatch(/test-runs\/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
            // Must NOT contain a second path segment after the timestamp
            const segments = directory.replace(/.*test-runs\//, '').split('/');
            expect(segments).toHaveLength(1);
        });

        test('uses a timestamp-based directory even when moduleId is provided but testRunId is absent', () => {
            const { writer } = createWriter();

            writer.createRunDirectory(undefined, 1, 'some-module');

            const directory = writer.getRunDirectory().value;
            expect(directory).toMatch(/test-runs\//);
            const segments = directory.replace(/.*test-runs\//, '').split('/');
            expect(segments).toHaveLength(1);
        });

        test('places run directory directly under test-runs/{buildId} when testRunId is provided without moduleId', () => {
            const { writer } = createWriter();

            writer.createRunDirectory('run-5', 1, undefined);

            const directory = writer.getRunDirectory().value;
            expect(directory).toMatch(/test-runs\/run-5$/);
        });
    });

    test.describe('attempt tracking', () => {

        test('getAttempt() returns the attempt number passed to createRunDirectory', () => {
            const { writer } = createWriter();
            writer.createRunDirectory('run-9', 2, 'mocha');
            expect(writer.getAttempt()).toBe(2);
        });

        test('getAttempt() returns 1 when attempt 1 was used', () => {
            const { writer } = createWriter();
            writer.createRunDirectory('run-10', 1, undefined);
            expect(writer.getAttempt()).toBe(1);
        });
    });
});

test.describe('RunDataWriter', () => {

    // Minimal valid RunData for testing
    const minimalRunData: RunData = {
        schemaVersion: 1,
        testRunId: 'test-run-1',
        attempt: 1,
        startedAt: '2024-06-15T14:30:00.000Z',
        finishedAt: '2024-06-15T14:30:01.000Z',
        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
        scenes: [],
        tags: [],
        testRunner: { name: 'Mocha', version: '11.0.0' },
        systemContext: {
            nodeVersion: 'v22.0.0',
            os: { name: 'linux', version: '6.0.0', arch: 'x64' },
            serenityVersion: '3.44.0',
            runtime: { provider: 'node', version: 'v22.0.0' },
        },
    };

    function createRunDataWriter(workerId?: string): { writer: RunDataWriter; filesystem: typeof fs; fileSystem: FileSystem } {
        const filesystem = createFsFromVolume(Volume.fromNestedJSON({ '/output': {} }, '/')) as unknown as typeof fs;
        const fileSystem = new FileSystem(Path.from('/output'), filesystem);
        const writer = new RunDataWriter(fileSystem, workerId);
        return { writer, filesystem, fileSystem };
    }

    test.describe('single-process mode (no workerId)', () => {

        test('writes db.json when no workerId is provided', () => {
            const { writer, filesystem } = createRunDataWriter();
            const runDirectory = Path.from('/output/test-runs/42/module-1');

            writer.write(minimalRunData, runDirectory);

            expect(filesystem.existsSync('/output/test-runs/42/module-1/db.json')).toBe(true);
        });

        test('does not create worker-suffixed files when no workerId is provided', () => {
            const { writer, filesystem } = createRunDataWriter();
            const runDirectory = Path.from('/output/test-runs/42/module-1');

            writer.write(minimalRunData, runDirectory);

            const files = filesystem.readdirSync('/output/test-runs/42/module-1') as string[];
            expect(files).toEqual(['db.json']);
        });
    });

    test.describe('parallel worker mode (with workerId)', () => {

        test('writes db-{workerId}.json when workerId is provided', () => {
            const { writer, filesystem } = createRunDataWriter('0-5');
            const runDirectory = Path.from('/output/test-runs/42/module-1');

            writer.write(minimalRunData, runDirectory);

            expect(filesystem.existsSync('/output/test-runs/42/module-1/db-0-5.json')).toBe(true);
        });

        test('does not create db.json when workerId is provided', () => {
            const { writer, filesystem } = createRunDataWriter('0-5');
            const runDirectory = Path.from('/output/test-runs/42/module-1');

            writer.write(minimalRunData, runDirectory);

            expect(filesystem.existsSync('/output/test-runs/42/module-1/db.json')).toBe(false);
        });

        test('multiple workers write to separate files', () => {
            const filesystem = createFsFromVolume(Volume.fromNestedJSON({ '/output': {} }, '/')) as unknown as typeof fs;
            const fileSystem = new FileSystem(Path.from('/output'), filesystem);
            const runDirectory = Path.from('/output/test-runs/42/webdriverio-1');

            // Simulate multiple WebdriverIO workers writing to the same directory
            const worker0 = new RunDataWriter(fileSystem, '0-0');
            const worker1 = new RunDataWriter(fileSystem, '0-1');
            const worker2 = new RunDataWriter(fileSystem, '0-2');

            worker0.write({ ...minimalRunData, scenes: [{ name: 'Test A' }] } as RunData, runDirectory);
            worker1.write({ ...minimalRunData, scenes: [{ name: 'Test B' }] } as RunData, runDirectory);
            worker2.write({ ...minimalRunData, scenes: [{ name: 'Test C' }] } as RunData, runDirectory);

            const files = (filesystem.readdirSync('/output/test-runs/42/webdriverio-1') as string[]).sort();
            expect(files).toEqual(['db-0-0.json', 'db-0-1.json', 'db-0-2.json']);
        });

        test('worker files contain valid JSON with the provided RunData', () => {
            const { writer, filesystem } = createRunDataWriter('0-5');
            const runDirectory = Path.from('/output/test-runs/42/module-1');
            const customRunData = { ...minimalRunData, testRunId: 'custom-run-123' };

            writer.write(customRunData, runDirectory);

            const content = filesystem.readFileSync('/output/test-runs/42/module-1/db-0-5.json', 'utf8') as string;
            const parsed = JSON.parse(content);
            expect(parsed.testRunId).toBe('custom-run-123');
        });

        test('handles worker IDs with various formats', () => {
            const testCases = [
                { workerId: '0-0', expectedFile: 'db-0-0.json' },
                { workerId: '0-55', expectedFile: 'db-0-55.json' },
                { workerId: '1-0', expectedFile: 'db-1-0.json' },
                { workerId: 'worker-1', expectedFile: 'db-worker-1.json' },
            ];

            for (const { workerId, expectedFile } of testCases) {
                const { writer, filesystem } = createRunDataWriter(workerId);
                const runDirectory = Path.from('/output/test-runs/run/module');

                writer.write(minimalRunData, runDirectory);

                expect(filesystem.existsSync(`/output/test-runs/run/module/${expectedFile}`)).toBe(true);
            }
        });
    });
});
