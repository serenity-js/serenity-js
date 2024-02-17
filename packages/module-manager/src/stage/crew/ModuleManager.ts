import type { ListensToDomainEvents, Stage, StageCrewMemberBuilder, StageCrewMemberBuilderDependencies } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events/index.js';
import { AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, SerenityInstallationDetected, TestRunStarts } from '@serenity-js/core/lib/events/index.js';
import { Duration, Timestamp } from '@serenity-js/core/lib/index.js';
import type { FileSystem } from '@serenity-js/core/lib/io/index.js';
import { ModuleLoader, Path, SerenityInstallationDetails, Version } from '@serenity-js/core/lib/io/index.js';
import { CorrelationId, Description, Name } from '@serenity-js/core/lib/model/index.js';
import { TinyType } from 'tiny-types';

import type { ModuleManagerConfig } from './ModuleManagerConfig.js';

export class ModuleManager implements ListensToDomainEvents {
    public static defaultCacheDirectory = 'node_modules/@serenity-js/module-manager/cache';

    static fromJSON({ cacheDirectory = ModuleManager.defaultCacheDirectory }: ModuleManagerConfig = {}): StageCrewMemberBuilder<ModuleManager> {
        return new ModuleManagerBuilder({ cacheDirectory });
    }

    constructor(
        private readonly moduleLoader: ModuleLoader,
        private readonly fileSystem: FileSystem,
        private readonly stage: Stage,
    ) {
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof TestRunStarts) {
            this.onTestRunStarts(event);
        }
    }

    private async onTestRunStarts(event: TestRunStarts): Promise<void> {
        const id = CorrelationId.create();
        try {
            this.stage.announce(new AsyncOperationAttempted(
                new Name(this.constructor.name),
                new Description(`Commencing dependency check...`),
                id,
                this.stage.currentTime(),
            ));

            const moduleManagerPreset = await this.moduleManagerPreset();
            const details = this.serenityInstallationDetails(moduleManagerPreset);

            this.stage.announce(new SerenityInstallationDetected(
                details,
                this.stage.currentTime(),
            ));

            this.stage.announce(new AsyncOperationCompleted(
                id,
                this.stage.currentTime(),
            ));
        }
        catch (error) {
            this.stage.announce(new AsyncOperationFailed(
                error,
                id,
                this.stage.currentTime(),
            ));
        }
    }

    private async moduleManagerPreset(): Promise<SerenityMetadataPreset> {

        const needsRebuilding = await this.shouldRebuildCache();

        if (needsRebuilding) {
            // todo: download ...
        }

        const pathToCachedInfoJson = this.pathToCached('module-manager.json');
        const contents = await this.fileSystem.readFile(pathToCachedInfoJson, { encoding: 'utf8' });

        return SerenityMetadataPreset.fromJSON(JSON.parse(contents) as SerialisedSerenityMetadataPreset);
    }

    private async shouldRebuildCache(): Promise<boolean> {
        const pathToCachedInfoJson = this.pathToCached('module-manager.json');
        const cachedInfoJsonExists = this.fileSystem.exists(pathToCachedInfoJson);

        if (! cachedInfoJsonExists) {
            return true;
        }

        const stats = await this.fileSystem.stat(pathToCachedInfoJson);

        const cacheCreatedAt = new Timestamp(stats.mtime);
        const contents = await this.fileSystem.readFile(pathToCachedInfoJson, { encoding: 'utf8' });
        const info = JSON.parse(contents) as SerialisedSerenityMetadataPreset;

        const now: Timestamp = this.stage.currentTime();
        const cachingDuration = new Duration(info.caching.duration);

        return now.diff(cacheCreatedAt).isGreaterThan(cachingDuration);
    }

    private pathToCached(fileName: string): Path {
        return Path.from(ModuleManager.defaultCacheDirectory, fileName);
    }

    private serenityInstallationDetails(serenityMetadata: SerenityMetadataPreset): SerenityInstallationDetails {
        const packages = Array.from(serenityMetadata.packages.keys());
        const integrations = Array.from(serenityMetadata.integrations.keys());

        const installedPackages = this.installedPackages(packages);
        const installedIntegrations = this.installedPackages(integrations);
        const availableUpdates = this.availableUpdates(serenityMetadata.packages, installedPackages);

        return new SerenityInstallationDetails(
            installedPackages,
            installedIntegrations,
            availableUpdates,
        );
    }

    private installedPackages(packages: string[]): Map<string, Version> {
        const result = new Map<string, Version>();

        for (const packageName of packages) {
            if (this.moduleLoader.hasAvailable(packageName)) {
                result.set(packageName, this.moduleLoader.versionOf(packageName));
            }
        }

        return result;
    }

    private availableUpdates(availablePackages: Map<string, Version>, installedPackages: Map<string, Version>): Map<string, Version> {
        const availableUpdates = new Map<string, Version>();

        for (const [ packageName, availableVersion ] of availablePackages.entries()) {

            if (installedPackages.has(packageName) && installedPackages.get(packageName).isLowerThan(availableVersion)) {
                availableUpdates.set(packageName, availableVersion);
            }
        }

        return availableUpdates;
    }
}

interface SerialisedSerenityMetadataPreset {
    packages: Record<string, string>;
    integrations: Record<string, string>;
    caching: {
        enabled: boolean;
        duration: number;
    };
    sampling: {
        enabled: boolean;
        rate: number;
    };
    updatedAt: string;
}

class SerenityMetadataPreset extends TinyType {
    static fromJSON(json: SerialisedSerenityMetadataPreset): SerenityMetadataPreset {
        return new SerenityMetadataPreset(
            new Map(Object.entries(json.packages).map(([packageName, version]) => [packageName, new Version(version)])),
            new Map(Object.entries(json.integrations)),
            CachingConfiguration.fromJSON(json.caching),
            SamplingConfigurationPreset.fromJSON(json.sampling),
            Timestamp.fromJSON(json.updatedAt),
        );
    }

    private constructor(
        public readonly packages: Map<string, Version>,
        public readonly integrations: Map<string, string>,
        public readonly caching: CachingConfiguration,
        public readonly sampling: SamplingConfigurationPreset,
        public readonly updatedAt: Timestamp,
    ) {
        super();
    }

    toJSON() {
        return {
            packages: packageVersionsToRecord(this.packages),
            integrations: Object.fromEntries(this.integrations.entries()),
            caching: this.caching.toJSON(),
            sampling: this.sampling.toJSON(),
            updatedAt: this.updatedAt.toJSON(),
        };
    }
}

function packageVersionsToRecord(map: Map<string, Version>): Record<string, string> {
    return Array.from(map.entries()).reduce((acc, [key, version]) => {
        acc[key] = version.toJSON() as string;
        return acc;
    }, {});
}

class CachingConfiguration extends TinyType {

    static fromJSON(json: { enabled: boolean, duration: number }): CachingConfiguration {
        return new CachingConfiguration(json.enabled, new Duration(json.duration));
    }

    constructor(public readonly enabled: boolean, public readonly duration: Duration) {
        super();
    }

    toJSON(): { enabled: boolean, duration: number } {
        return {
            enabled: this.enabled,
            duration: this.duration.inMilliseconds(),
        };
    }
}

class SamplingConfigurationPreset extends TinyType {

    static fromJSON(json: { enabled: boolean, rate: number }): SamplingConfigurationPreset {
        return new SamplingConfigurationPreset(json.enabled, json.rate);
    }

    constructor(public readonly enabled: boolean, public readonly rate: number) {
        super();
    }

    toJSON(): { enabled: boolean, rate: number } {
        return {
            enabled: this.enabled,
            rate: this.rate,
        };
    }
}

class ModuleManagerBuilder implements StageCrewMemberBuilder<ModuleManager> {
    constructor(private readonly config: ModuleManagerConfig) {
    }

    build({ stage, fileSystem }: StageCrewMemberBuilderDependencies): ModuleManager {
        const cwd = fileSystem.resolve(Path.from('.'));
        const moduleLoader = new ModuleLoader(cwd.value);

        return new ModuleManager(
            moduleLoader,
            fileSystem,
            stage,
        );
    }
}
