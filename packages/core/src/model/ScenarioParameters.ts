import type { JSONObject} from 'tiny-types';
import { ensure, isDefined, TinyType } from 'tiny-types';

import { Description } from './Description.js';
import { Name } from './Name.js';

export class ScenarioParameters extends TinyType {
    public static fromJSON(o: JSONObject): ScenarioParameters {
        return new ScenarioParameters(
            Name.fromJSON(o.name as string),
            Description.fromJSON(o.description as string),
            (o as any).values,
        );
    }

    constructor(
        public readonly name: Name,
        public readonly description: Description,
        public readonly values: { [ parameter: string ]: string },
    ) {
        super();

        ensure('name', name, isDefined());
        ensure('description', description, isDefined());
        ensure('values', values, isDefined());
    }
}
