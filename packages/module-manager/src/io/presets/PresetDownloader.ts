import type { AxiosInstance } from 'axios';
import type { TinyType } from 'tiny-types';

import type { PresetType } from './PresetType.js';

export class PresetDownloader {
    constructor(private readonly axios: AxiosInstance) {
    }

    public async download<Preset extends TinyType>(presetType: PresetType<Preset>): Promise<Preset> {
        const response = await this.axios.get(presetType.fileName, { responseType: 'json' });
        return presetType.fromJSON(response.data);
    }
}