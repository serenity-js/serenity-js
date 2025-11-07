import { Ability } from '@serenity-js/core';
import { Version } from '@serenity-js/core/lib/io/index.js';
import type { AxiosInstance } from 'axios';

interface SerenityModuleManagerPreset {
    engines: {
        node: string;
    };
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

export interface Compatibility {
    status: 'compatible' | 'incompatible' | 'missing';
    version: {
        current?: string;
        supported?: string;
    }
}

export class SerenityModuleManager extends Ability {
    private static presetUrl = `https://serenity-js.org/presets/v3/module-manager.json`;
    private preset: SerenityModuleManagerPreset;

    constructor(private readonly axios: AxiosInstance) {
        super();
    }

    public async currentVersionOf(packageName: string): Promise<string | undefined> {
        const preset = await this.fetchPreset();
        return preset.packages[packageName];
    }

    public async supportedVersionRangeOf(name: string): Promise<string | undefined> {
        const preset = await this.fetchPreset();
        return {
            ...preset.packages,
            ...preset.engines,
            ...preset.integrations,
        }[name];
    }

    public async compatibilityStatus(name: string, currentVersion: string | undefined): Promise<Compatibility> {

        const supportedVersionOrRange = await this.supportedVersionRangeOf(name);

        const compatibility = {
            version: {
                current: currentVersion,
                supported: supportedVersionOrRange,
            },
        }

        if (! currentVersion) {
            return {
                ...compatibility,
                status: 'missing',
                version: {
                    supported: supportedVersionOrRange ?? 'latest',
                },
            };
        }

        if (! supportedVersionOrRange) {
            return {
                ...compatibility,
                status: 'compatible',
            };
        }

        try {
            return Version.fromJSON(currentVersion).satisfies(supportedVersionOrRange)
                ? { ...compatibility, status: 'compatible' }
                : { ...compatibility, status: 'incompatible' }
        } catch {
            return { ...compatibility, status: 'incompatible' }
        }
    }

    private async fetchPreset(): Promise<SerenityModuleManagerPreset> {
        if (! this.preset) {
            const response = await this.axios.get<SerenityModuleManagerPreset>(SerenityModuleManager.presetUrl);
            this.preset = response.data;
        }

        return this.preset;
    }
}
