import type { CorrelationId } from '@serenity-js/core/model';

import type { TestStepSchema } from '../serenity-bdd-report-schema';

/**
 * @package
 */
export interface LinkedTestStep {
    step: TestStepSchema;
    parentActivityId: CorrelationId;
}
