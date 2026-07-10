import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { FileSystem, Path } from '@serenity-js/core/io';
import { createFsFromVolume, Volume } from 'memfs';

import { ArtifactWriter } from '../../src/cli/ArtifactWriter.js';

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
            // Must be directly under test-runs/ with an ISO timestamp
            expect(directory).toMatch(/test-runs\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
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
