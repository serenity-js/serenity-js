import { ensure, isDefined, TinyType } from 'tiny-types';

import { Timestamp } from '../model';

/**
 * @desc
 *  Represents an internal domain event that occurs during test execution.
 *
 * @abstract
 * @extends {tiny-types~TinyType}
 */
export abstract class DomainEvent extends TinyType {

    /**
     * @param {Timestamp} timestamp
     * @protected
     */
    protected constructor(public readonly timestamp: Timestamp = new Timestamp()) {
        super();
        ensure('timestamp', timestamp, isDefined());
    }
}
