import type { JSONObject} from 'tiny-types';
import { TinyType } from 'tiny-types';

import { FileSystemLocation } from '../io/index.js';
import { CorrelationId } from './CorrelationId.js';
import { Name } from './Name.js';

export class TestSuiteDetails extends TinyType {
    static fromJSON(o: JSONObject): TestSuiteDetails {
        return new TestSuiteDetails(
            Name.fromJSON(o.name as string),
            FileSystemLocation.fromJSON(o.location as JSONObject),
            CorrelationId.fromJSON(o.correlationId as string),
        );
    }

    constructor(
        public readonly name: Name,
        public readonly location: FileSystemLocation,
        public readonly correlationId: CorrelationId = CorrelationId.create(),
    ) {
        super();
    }
}
