import { z } from 'zod';

export const VersionSchema = z.object({
    current: z.string().optional().describe('Current version, if detected'),
    supported: z.string().optional().describe('Supported version'),
});

export const PackageSchema = z.object({
    name: z.string().describe('The name of the Node.js package'),
    status: z.enum([ 'compatible', 'incompatible', 'missing' ]),
    version: VersionSchema,
});

export const TestRunnerNameSchema = z.enum([
    '@cucumber/cucumber',
    '@playwright/test',
    '@wdio/cli',
    'cucumber',
    'protractor',
    'jasmine',
    'mocha',
]).describe('Test runner');

export const DryRunSchema = z.boolean()
    .default(false)
    .describe('If true, the tool will simulate the requested operation, but will not make any changes to the file system');
