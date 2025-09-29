import { z } from 'zod';

export const versionSchema = z.object({
    current: z.string().optional().describe('Current version, if detected'),
    supported: z.string().optional().describe('Supported version'),
});

export const packageSchema = z.object({
    name: z.string().describe('The name of the Node.js package'),
    status: z.enum([ 'compatible', 'incompatible', 'missing' ]),
    version: versionSchema,
});

export const testRunnerSchema = z.enum([
    'cucumber',
    'jasmine',
    'mocha',
    'playwright-test',
    'protractor',
    'webdriverio',
]).describe('Test runner');
