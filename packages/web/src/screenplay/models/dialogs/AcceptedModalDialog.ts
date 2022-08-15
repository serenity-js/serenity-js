import { ensure, isDefined } from 'tiny-types';

import { ModalDialog } from './ModalDialog';

/**
 * `AcceptedModalDialog` represents a {@apilink ModalDialog} that has been accepted
 * via {@apilink ModalDialog.acceptNext}.
 *
 * ## Learn more
 * - {@apilink ModalDialog}
 *
 * @group Models
 */
export class AcceptedModalDialog extends ModalDialog {
    constructor(private readonly dialogMessage: string) {
        super();
        ensure('dialogMessage', dialogMessage, isDefined());
    }

    async isPresent(): Promise<boolean> {
        return true;
    }

    async message(): Promise<string> {
        return this.dialogMessage;
    }
}
