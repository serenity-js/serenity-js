import { ensure, isDefined } from 'tiny-types';

import { ModalDialog } from './ModalDialog';

/**
 * `AcceptedModalDialog` represents a {@link ModalDialog} that has been accepted
 * via [[ModalDialog.acceptNext]].
 *
 * ## Learn more
 * - {@link ModalDialog}
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
