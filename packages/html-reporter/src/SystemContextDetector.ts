import * as os from 'node:os';

import type { ModuleLoader, Version } from '@serenity-js/core/io';

import type { CIDetector, RuntimeContext } from './CiDetector.js';

/**
 * System context information included in the test run data.
 */
export interface SystemContext {
    nodeVersion: string;
    os: { name: string; version: string; arch: string };
    serenityVersion: Version;
    runtime: RuntimeContext;
}

/**
 * Detects runtime environment information from Node.js APIs.
 *
 * @package
 */
export class SystemContextDetector {

    constructor(
        private readonly ciDetector: CIDetector,
        private readonly moduleLoader: ModuleLoader,
    ) {
    }

    detect(): SystemContext {
        return {
            nodeVersion: process.version,
            os: {
                name: os.platform(),
                version: os.release(),
                arch: os.arch(),
            },
            serenityVersion: this.moduleLoader.versionOf('@serenity-js/core'),
            runtime: this.ciDetector.detect(),
        };
    }
}
