import { Duration, Timestamp } from '@serenity-js/core';
import type { FileSystem } from '@serenity-js/core/lib/io/index.js';
import { Path } from '@serenity-js/core/lib/io/index.js';
import type { JSONObject} from 'tiny-types';
import { type TinyType } from 'tiny-types';

import type { HasCachingConfiguration } from './caching.js';
import type { PresetDownloader } from './PresetDownloader.js';
import type { PresetType } from './PresetType.js';

export class Presets {

    constructor(
        private readonly fileSystem: FileSystem,
        private readonly downloader: PresetDownloader,
        private readonly cacheDirectory: Path,
    ) {
    }

    public async fetch<Preset extends TinyType>(presetType: PresetType<Preset>, now: Timestamp): Promise<Preset> {
        const cachedPreset = await this.loadCachedPresetIfUpToDate(presetType, now);

        if (cachedPreset) {
            return cachedPreset;
        }

        return this.downloadAndCache(presetType);
    }

    private async read(pathToCachedPreset: Path): Promise<JSONObject> {
        const contents = await this.fileSystem.readFile(pathToCachedPreset, { encoding: 'utf8' });

        return JSON.parse(contents);
    }

    private async loadCachedPresetIfUpToDate<Preset extends TinyType>(presetType: PresetType<Preset>, now: Timestamp): Promise<Preset | undefined> {
        const noCurrentCacheAvailable = undefined;

        const pathToCachedPreset   = this.pathToCached(presetType.fileName);
        const cachedInfoJsonExists = this.fileSystem.exists(pathToCachedPreset);

        if (! cachedInfoJsonExists) {
            return noCurrentCacheAvailable;
        }

        const serialisedPreset = await this.read(pathToCachedPreset);
        const preset           = presetType.fromJSON(serialisedPreset)

        const cachingDuration = this.hasCachingConfiguration(preset) && preset.caching.enabled
            ? preset.caching.duration
            : Duration.ofMilliseconds(0);

        const stats          = await this.fileSystem.stat(pathToCachedPreset);
        const cacheCreatedAt = new Timestamp(stats.mtime);

        if (now.diff(cacheCreatedAt).isGreaterThan(cachingDuration)) {
            return noCurrentCacheAvailable;
        }

        return preset;
    }

    private hasCachingConfiguration<Preset extends TinyType>(preset: Preset): preset is Preset & HasCachingConfiguration {
        return 'caching' in preset;
    }

    private pathToCached(fileName: string): Path {
        return this.fileSystem.resolve(this.cacheDirectory.join(Path.from(fileName)));
    }

    private async downloadAndCache<Preset extends TinyType>(presetType: PresetType<Preset>): Promise<Preset> {
        const preset = await this.downloader.download(presetType);

        return this.cache(presetType, preset);
    }

    private async cache<Preset extends TinyType>(presetType: PresetType<Preset>, preset: Preset): Promise<Preset> {

        const pathToCachedPreset = this.pathToCached(presetType.fileName);

        await this.fileSystem.store(pathToCachedPreset, JSON.stringify(preset.toJSON(), undefined, 4));

        return preset;
    }
}
