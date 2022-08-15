import { ensure, isDefined } from 'tiny-types';

import { ModalDialog } from './ModalDialog';

/**
 * `DismissedModalDialog` represents a {@apilink ModalDialog} that has been dismissed
 * via {@apilink ModalDialog.dismissNext}.
 *
 * ## Learn more
 * - {@apilink ModalDialog}
 *
 * @group Models
 */
export class DismissedModalDialog extends ModalDialog {
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
