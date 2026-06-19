import { existsSync, readFileSync } from 'node:fs';
import * as os from 'node:os';
import { join } from 'node:path';

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
    projectName?: string;
    packageManager?: string;
    environmentUnderTest?: string;
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
        private readonly overrides: { projectName?: string } = {},
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
            projectName: this.overrides.projectName || this.detectProjectName(),
            packageManager: this.detectPackageManager(),
            environmentUnderTest: this.detectEnvironmentUnderTest(),
        };
    }

    private detectProjectName(): string | undefined {
        try {
            const pkgPath = join(this.moduleLoader.cwd, 'package.json');
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name?: string };
            return pkg.name || undefined;
        } catch {
            return undefined;
        }
    }

    private detectPackageManager(): string | undefined {
        let cwd = this.moduleLoader.cwd;
        for (let i = 0; i < 10; i++) {
            if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
            if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn';
            if (existsSync(join(cwd, 'package-lock.json'))) return 'npm';
            if (existsSync(join(cwd, 'bun.lockb'))) return 'bun';
            const parent = join(cwd, '..');
            if (parent === cwd) break;
            cwd = parent;
        }
        return undefined;
    }

    private detectEnvironmentUnderTest(): string | undefined {
        return process.env.BASE_URL
            || process.env.TEST_ENV
            || undefined;
    }
}
