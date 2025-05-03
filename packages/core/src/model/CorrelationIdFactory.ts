import type { CorrelationId } from './CorrelationId';

export interface CorrelationIdFactory {
    /**
     * Creates a new CorrelationId
     */
    create(): CorrelationId;
}
