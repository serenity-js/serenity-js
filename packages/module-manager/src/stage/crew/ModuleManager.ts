import type {
    ListensToDomainEvents,
    Stage,
    StageCrewMemberBuilder,
    StageCrewMemberBuilderDependencies
} from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events/index.js';
import {
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    AsyncOperationFailed,
    SerenityInstallationDetected,
    TestRunStarts
} from '@serenity-js/core/lib/events/index.js';
import type { Version } from '@serenity-js/core/lib/io/index.js';
import { ModuleLoader, Path, SerenityInstallationDetails } from '@serenity-js/core/lib/io/index.js';
import { CorrelationId, Description, Name } from '@serenity-js/core/lib/model/index.js';
import { createAxios } from '@serenity-js/rest';
import type { AxiosInstance } from 'axios';

import { ModuleManagerPreset, Presets } from '../../io/presets/index.js';
import { PresetDownloader } from '../../io/presets/PresetDownloader.js';
import type { ModuleManagerConfig } from './ModuleManagerConfig.js';

export class ModuleManager implements ListensToDomainEvents {
    public static defaultCacheDirectory = 'node_modules/@serenity-js/module-manager/cache';
    public static defaultBaseURL = 'https://raw.githubusercontent.com/serenity-js/serenity-js/gh-pages/presets/v1/';

    static fromJSON({ cacheDirectory = ModuleManager.defaultCacheDirectory, baseURL = ModuleManager.defaultBaseURL }: ModuleManagerConfig = {}): StageCrewMemberBuilder<ModuleManager> {
        return new ModuleManagerBuilder(Path.from(cacheDirectory), new URL(baseURL));
    }

    constructor(
        private readonly moduleLoader: ModuleLoader,
        private readonly presets: Presets,
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

    private async moduleManagerPreset(): Promise<ModuleManagerPreset> {
        return this.presets.fetch(ModuleManagerPreset, this.stage.currentTime());
    }

    private serenityInstallationDetails(moduleManagerPreset: ModuleManagerPreset): SerenityInstallationDetails {
        const packages      = Array.from(moduleManagerPreset.packages.keys());
        const integrations  = Array.from(moduleManagerPreset.integrations.keys());

        const installedPackages     = this.installedPackages(packages);
        const installedIntegrations = this.installedPackages(integrations);
        const availableUpdates      = this.availableUpdates(moduleManagerPreset.packages, installedPackages);

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

class ModuleManagerBuilder implements StageCrewMemberBuilder<ModuleManager> {
    constructor(
        private readonly cacheDirectory: Path,
        private readonly baseURL: URL,
    ) {
    }

    build({ stage, fileSystem }: StageCrewMemberBuilderDependencies): ModuleManager {

        const cwd           = fileSystem.resolve(Path.from('.'));
        const moduleLoader  = new ModuleLoader(cwd.value);
        const presets       = new Presets(
            fileSystem,
            new PresetDownloader(
                createAxios({ baseURL: this.baseURL.toString() }) as AxiosInstance
            ),
            this.cacheDirectory
        );

        return new ModuleManager(
            moduleLoader,
            presets,
            stage,
        );
    }
}
