import type { JSONObject, TinyType } from 'tiny-types';

export interface PresetType<Preset extends TinyType> {
    fileName: string;
    fromJSON(json: JSONObject): Preset;
}
