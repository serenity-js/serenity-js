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

export class SerenityModuleManager {
    private static presetUrl = `https://serenity-js.org/presets/v3/module-manager.json`;
    private preset: SerenityModuleManagerPreset;

    constructor(private readonly axios: AxiosInstance) {
    }

    public async supportedNodeVersion(): Promise<string> {
        const preset = await this.fetchPreset();
        return preset.engines.node;
    }

    public async versionOf(packageName: string): Promise<string | undefined> {
        const preset = await this.fetchPreset();
        return preset.packages[packageName];
    }

    public async supportedVersionOf(integrationName: string): Promise<string | undefined> {
        const preset = await this.fetchPreset();
        return preset.integrations[integrationName];
    }

    private async fetchPreset(): Promise<SerenityModuleManagerPreset> {
        if (! this.preset) {
            const response = await this.axios.get<SerenityModuleManagerPreset>(SerenityModuleManager.presetUrl);
            this.preset = response.data;
        }

        return this.preset;
    }
}
