import type { CorrelationId } from '@serenity-js/core/lib/model';

import type { TestStep } from '../SerenityBDDJsonSchema';

/**
 * @package
 */
export interface LinkedTestStep {
    step: TestStep;
    parentActivityId: CorrelationId;
}
