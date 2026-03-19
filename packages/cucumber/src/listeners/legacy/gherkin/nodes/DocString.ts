import type { StepArgument } from './StepArgument.js';

/**
 * @private
 */
export interface DocString extends StepArgument {
    type: 'DocString';
    content: string;
}
