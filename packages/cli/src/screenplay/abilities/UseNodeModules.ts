import * as fs from 'node:fs';
import * as path from 'node:path';

import { Ability } from '@serenity-js/core';

/**
 * Information about an installed module.
 *
 * @group Model
 */
export interface ModuleInfo {
    /** The module name (e.g., '@serenity-js/core') */
    name: string;
    /** The installed version */
    version: string;
    /** The path to the module directory */
    path: string;
}

/**
 * Represents a minimal package.json structure.
 *
 * @group Model
 */
export interface PackageJson {
    name: string;
    version: string;
    description?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    [key: string]: unknown;
}

/**
 * A file system interface for reading directories and files.
 * This allows for dependency injection of mock file systems in tests.
 *
 * @package
 */
export interface FileSystem {
    promises: {
        readdir(path: string, options?: { withFileTypes: boolean }): Promise<fs.Dirent[]>;
        readFile(path: string, encoding: BufferEncoding): Promise<string>;
        access(path: string): Promise<void>;
    };
}

/**
 * An {@link Ability} that enables an {@link Actor} to scan and read from
 * the project's `node_modules` directory.
 *
 * ## Example
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core';
 * import { UseNodeModules, InstalledSerenityModules } from '@serenity-js/cli';
 *
 * const actor = actorCalled('Alice').whoCan(
 *     UseNodeModules.at(process.cwd())
 * );
 *
 * const modules = await actor.answer(InstalledSerenityModules());
 * ```
 *
 * @group Abilities
 */
export class UseNodeModules extends Ability {

    /**
     * Creates an ability to use node_modules at the specified project root.
     *
     * @param projectRoot - The root directory of the project
     * @param fileSystem - Optional file system implementation (defaults to Node.js fs)
     */
    static at(projectRoot: string, fileSystem: FileSystem = fs): UseNodeModules {
        return new UseNodeModules(projectRoot, fileSystem);
    }

    /**
     * Creates an ability to use node_modules at the specified project root.
     *
     * @param projectRoot - The root directory of the project
     * @param fileSystem - Optional file system implementation (defaults to Node.js fs)
     */
    constructor(
        private readonly projectRoot: string,
        private readonly fileSystem: FileSystem = fs,
    ) {
        super();
    }

    /**
     * Lists all installed `@serenity-js/*` packages.
     *
     * @returns A promise that resolves to an array of module information
     */
    async listSerenityPackages(): Promise<ModuleInfo[]> {
        const serenityDirectory = path.join(this.projectRoot, 'node_modules', '@serenity-js');

        try {
            await this.fileSystem.promises.access(serenityDirectory);
        }
        catch {
            return [];
        }

        const entries = await this.fileSystem.promises.readdir(serenityDirectory, { withFileTypes: true });
        const packages: ModuleInfo[] = [];

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const modulePath = path.join(serenityDirectory, entry.name);
                const packageJsonPath = path.join(modulePath, 'package.json');

                try {
                    const content = await this.fileSystem.promises.readFile(packageJsonPath, 'utf-8');
                    const pkg = JSON.parse(content) as PackageJson;

                    packages.push({
                        name: pkg.name,
                        version: pkg.version,
                        path: modulePath,
                    });
                }
                catch {
                    // Skip modules without valid package.json
                }
            }
        }

        return packages;
    }

    /**
     * Reads and parses the package.json for a specific module.
     *
     * @param moduleName - The name of the module (e.g., '@serenity-js/core' or 'playwright')
     * @returns A promise that resolves to the parsed package.json
     * @throws Error if the module cannot be found
     */
    async readPackageJson(moduleName: string): Promise<PackageJson> {
        const modulePath = this.getModulePath(moduleName);
        const packageJsonPath = path.join(modulePath, 'package.json');

        try {
            const content = await this.fileSystem.promises.readFile(packageJsonPath, 'utf-8');
            return JSON.parse(content) as PackageJson;
        }
        catch {
            throw new Error(`Cannot find module '${ moduleName }' at ${ modulePath }`);
        }
    }

    /**
     * Checks if a module exists in node_modules.
     *
     * @param moduleName - The name of the module to check
     * @returns A promise that resolves to true if the module exists, false otherwise
     */
    async moduleExists(moduleName: string): Promise<boolean> {
        const modulePath = this.getModulePath(moduleName);
        const packageJsonPath = path.join(modulePath, 'package.json');

        try {
            await this.fileSystem.promises.access(packageJsonPath);
            return true;
        }
        catch {
            return false;
        }
    }

    /**
     * Checks if a file exists in the project root.
     *
     * @param filename - The name of the file to check (e.g., 'package-lock.json')
     * @returns A promise that resolves if the file exists, rejects otherwise
     */
    async fileExists(filename: string): Promise<void> {
        const filePath = path.join(this.projectRoot, filename);
        await this.fileSystem.promises.access(filePath);
    }

    private getModulePath(moduleName: string): string {
        // Handle scoped packages like @serenity-js/core
        if (moduleName.startsWith('@')) {
            const [scope, name] = moduleName.split('/');
            return path.join(this.projectRoot, 'node_modules', scope, name);
        }
        return path.join(this.projectRoot, 'node_modules', moduleName);
    }
}
