import { Duration } from '@serenity-js/core';
import type { JSONObject} from 'tiny-types';
import { TinyType } from 'tiny-types';

export interface SerialisedCachingConfiguration extends JSONObject {
    enabled: boolean;
    duration: number;
}

export class CachingConfiguration extends TinyType {

    static fromJSON(json: SerialisedCachingConfiguration): CachingConfiguration {
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

export interface HasCachingConfiguration {
    caching: CachingConfiguration;
}
