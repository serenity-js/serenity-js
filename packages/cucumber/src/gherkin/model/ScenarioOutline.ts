import { Description, Name, ScenarioParameters } from '@serenity-js/core/lib/model';
import { TinyType } from 'tiny-types';

import { Step } from './Step';

export class ScenarioOutline extends TinyType {
    constructor(
        public readonly name: Name,
        public readonly description: Description,
        public readonly steps: Step[],
        public readonly parameters: { [line: number]: ScenarioParameters },
    ) {
        super();
    }
}
