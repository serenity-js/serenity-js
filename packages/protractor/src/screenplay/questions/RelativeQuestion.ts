import { Question } from '@serenity-js/core';

/**
 * @public
 * @interface
 */
export interface RelativeQuestion<Parent, Answer> {
    name?: string;
    toString(): string;
    of(parent: Parent): Question<Answer>;
}
