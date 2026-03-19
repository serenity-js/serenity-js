import type { CorrelationId } from './CorrelationId.js';

export interface CorrelationIdFactory {
    /**
     * Creates a new CorrelationId
     */
    create(): CorrelationId;
}
