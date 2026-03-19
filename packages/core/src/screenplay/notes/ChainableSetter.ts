import type { Answerable } from '../Answerable.js';
import type { Interaction } from '../Interaction.js';

/**
 * @group Notes
 */
export interface ChainableSetter<T extends Record<any, any>> {
    set<K extends keyof T>(key: K, value: Answerable<T[K]>): ChainableSetter<T> & Interaction;
}
