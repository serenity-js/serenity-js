export interface ModuleManagerConfig {

    /**
     * Cache directory, relative to `cwd`
     * Defaults to `node_modules/@serenity-js/module-manager/cache`
     */
    cacheDirectory?: string;

    /**
     * Base URL to use when fetching the presets
     */
    baseURL?: string;
}
