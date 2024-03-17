import { ensure, isDefined, isPlainObject,type JSONObject, TinyType } from 'tiny-types';

import { Version } from './Version';

export class SerenityInstallationDetails extends TinyType {

    static fromJSON(json: JSONObject): SerenityInstallationDetails {
        return new SerenityInstallationDetails(
            this.versionsAsMap(json, 'packages'),
            this.versionsAsMap(json, 'integrations'),
            this.versionsAsMap(json, 'updates'),
        );
    }

    private static versionsAsMap(json: JSONObject, name: string): Map<string, Version> {
        const maybeRecord = json?.[name] as any;
        const record = ensure<Record<string, string>>(name, maybeRecord, isDefined(), isPlainObject());

        return new Map(
            Object.entries(record)
                .map(([ packageName, version ]) => [ packageName, new Version(version) ])
        );
    }

    constructor(
        public readonly packages: Map<string, Version>,
        public readonly integrations: Map<string, Version>,
        public readonly updates: Map<string, Version>,
    ) {
        super();
    }
}
