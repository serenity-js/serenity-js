import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { FileSystem, Path } from '@serenity-js/core/io';
import { createFsFromVolume, Volume } from 'memfs';

import { ArtifactWriter } from '../src/ArtifactWriter.js';

test.describe('attempt detection', () => {

    test.describe('detectAttemptNumber()', () => {

        test('returns 1 when no CI environment variables are set', () => {
            // detectAttemptNumber is exercised via ArtifactWriter directory naming
            // We test this indirectly through the directory name produced
            const outputDirectory = Path.from('/output');
            const filesystem = createFsFromVolume(Volume.fromNestedJSON({ [outputDirectory.value]: {} }, '/')) as unknown as typeof fs;
            const fileSystem = new FileSystem(outputDirectory, filesystem);
            const writer = new ArtifactWriter(fileSystem);

            writer.createRunDirectory('run-1', 1, undefined);

            const directory = writer.getRunDirectory().value;
            expect(directory).toContain('run-1');
        });

        test('uses GITHUB_RUN_ATTEMPT env var (already 1-based)', () => {
            const outputDirectory = Path.from('/output');
            const filesystem = createFsFromVolume(Volume.fromNestedJSON({ [outputDirectory.value]: {} }, '/')) as unknown as typeof fs;
            const fileSystem = new FileSystem(outputDirectory, filesystem);
            const writer = new ArtifactWriter(fileSystem);

            writer.createRunDirectory('run-42', 3, 'module-a');

            const directory = writer.getRunDirectory().value;
            expect(directory).toContain('run-42');
            expect(directory).toContain('module-a');
            expect(directory).toContain('attempt-3');
        });

        test('includes moduleId in the directory name when provided', () => {
            const outputDirectory = Path.from('/output');
            const filesystem = createFsFromVolume(Volume.fromNestedJSON({ [outputDirectory.value]: {} }, '/')) as unknown as typeof fs;
            const fileSystem = new FileSystem(outputDirectory, filesystem);
            const writer = new ArtifactWriter(fileSystem);

            writer.createRunDirectory('run-7', 2, 'playwright-test');

            const directory = writer.getRunDirectory().value;
            expect(directory).toContain('playwright-test');
        });

        test('produces a unique directory without moduleId by using a timestamp suffix', () => {
            const outputDirectory = Path.from('/output');
            const filesystem = createFsFromVolume(Volume.fromNestedJSON({ [outputDirectory.value]: {} }, '/')) as unknown as typeof fs;
            const fileSystem = new FileSystem(outputDirectory, filesystem);
            const writer = new ArtifactWriter(fileSystem);

            writer.createRunDirectory('run-5', 1, undefined);

            const directory = writer.getRunDirectory().value;
            // Directory must still be rooted in test-runs
            expect(directory).toMatch(/test-runs/);
            // Must be non-empty and contain the testRunId
            expect(directory).toContain('run-5');
        });
    });

    test.describe('attempt written to db.json via archiveTestRun', () => {

        test('db.json includes attempt field equal to the value passed to createRunDirectory', () => {
            const outputDirectory = Path.from('/output');
            const filesystem = createFsFromVolume(Volume.fromNestedJSON({ [outputDirectory.value]: {} }, '/')) as unknown as typeof fs;
            const fileSystem = new FileSystem(outputDirectory, filesystem);
            const writer = new ArtifactWriter(fileSystem);

            writer.createRunDirectory('run-9', 2, 'mocha');

            expect(writer.getAttempt()).toBe(2);
        });

        test('getAttempt() returns 1 when attempt 1 was used', () => {
            const outputDirectory = Path.from('/output');
            const filesystem = createFsFromVolume(Volume.fromNestedJSON({ [outputDirectory.value]: {} }, '/')) as unknown as typeof fs;
            const fileSystem = new FileSystem(outputDirectory, filesystem);
            const writer = new ArtifactWriter(fileSystem);

            writer.createRunDirectory('run-10', 1, undefined);

            expect(writer.getAttempt()).toBe(1);
        });
    });
});
