import { LogicError } from '@serenity-js/core';

import { ModalDialog } from './ModalDialog';

export class AbsentModalDialog extends ModalDialog {
    async isPresent(): Promise<boolean> {
        return false;
    }

    async message(): Promise<string> {
        throw new LogicError(`Can't retrieve the message of a modal dialog that hasn't been handled yet`);
    }
}
