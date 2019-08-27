import { Interaction } from '@serenity-js/core';
import { Notification } from '../../model';

/**
 * @package
 */
export const Notify = {
    that: (message: string) => Interaction.where(`#actor notifies that "${ message }"`, actor =>
        actor.collect(Notification.fromJSON({ message })),
    ),
};
