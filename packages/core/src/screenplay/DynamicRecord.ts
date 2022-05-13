import { Answerable } from './Answerable';
import { Question } from './Question';

/* eslint-disable @typescript-eslint/indent */

/**
 * @experimental
 */
export type DynamicRecord<
    T extends Exclude<
        Record<any, any>,
        Question<Promise<any>> | Question<any> | Promise<any>
    >
> = {
    [K in keyof T]:
        T[K] extends Record<any, any>
            ? Answerable<DynamicRecord<T[K]>>
            : Answerable<T[K]>;
}

/* eslint-enable @typescript-eslint/indent */
