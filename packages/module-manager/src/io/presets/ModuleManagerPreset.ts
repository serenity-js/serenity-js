import { Timestamp } from '@serenity-js/core';
import { Version } from '@serenity-js/core/lib/io/index.js';
import { type JSONObject, TinyType } from 'tiny-types';

import type { HasCachingConfiguration} from './caching.js';
import { CachingConfiguration, type SerialisedCachingConfiguration } from './caching.js';

export interface SerialisedModuleManagerPreset extends JSONObject {
    packages: Record<string, string>;
    integrations: Record<string, string>;
    caching: SerialisedCachingConfiguration;
    sampling: {
        enabled: boolean;
        rate: number;
    };
    updatedAt: string;
}

export class ModuleManagerPreset extends TinyType implements HasCachingConfiguration {
    static fileName = 'module-manager.json';

    static fromJSON(json: SerialisedModuleManagerPreset): ModuleManagerPreset {
        return new ModuleManagerPreset(
            new Map(Object.entries(json.packages).map(([packageName, version]) => [packageName, new Version(version)])),
            new Map(Object.entries(json.integrations)),
            CachingConfiguration.fromJSON(json.caching),
            SamplingConfiguration.fromJSON(json.sampling),
            Timestamp.fromJSON(json.updatedAt),
        );
    }

    private constructor(
        public readonly packages: Map<string, Version>,
        public readonly integrations: Map<string, string>,
        public readonly caching: CachingConfiguration,
        public readonly sampling: SamplingConfiguration,
        public readonly updatedAt: Timestamp,
    ) {
        super();
    }

    private static asRecord(map: Map<string, Version>): Record<string, string> {
        return Array.from(map.entries()).reduce((acc, [key, version]) => {
            acc[key] = version.toJSON() as string;
            return acc;
        }, {});
    }

    toJSON(): SerialisedModuleManagerPreset & JSONObject {
        return {
            packages: ModuleManagerPreset.asRecord(this.packages),
            integrations: Object.fromEntries(this.integrations.entries()),
            caching: this.caching.toJSON(),
            sampling: this.sampling.toJSON(),
            updatedAt: this.updatedAt.toJSON(),
        };
    }
}

class SamplingConfiguration extends TinyType {

    static fromJSON(json: { enabled: boolean, rate: number }): SamplingConfiguration {
        return new SamplingConfiguration(json.enabled, json.rate);
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
