import { LogicError } from '@serenity-js/core';

import { ModalDialog } from './ModalDialog';

/**
 * `AbsentModalDialog` is a [null object](https://en.wikipedia.org/wiki/Null_object_pattern)
 * representing a {@apilink ModalDialog} that hasn't appeared yet.
 *
 * ## Learn more
 * - {@apilink ModalDialog}
 *
 * @group Models
 */
export class AbsentModalDialog extends ModalDialog {
    async isPresent(): Promise<boolean> {
        return false;
    }

    async message(): Promise<string> {
        throw new LogicError(`Can't retrieve the message of a modal dialog that hasn't been handled yet`);
    }
}
