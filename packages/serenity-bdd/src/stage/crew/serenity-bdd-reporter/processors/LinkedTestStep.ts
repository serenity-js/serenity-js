import { CorrelationId } from '@serenity-js/core/lib/model';

import { TestStep } from '../SerenityBDDJsonSchema';

/**
 * @package
 */
export interface LinkedTestStep {
    step: TestStep;
    parentActivityId: CorrelationId;
}
