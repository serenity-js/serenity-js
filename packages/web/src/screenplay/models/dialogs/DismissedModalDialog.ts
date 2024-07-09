import { ensure, isDefined } from 'tiny-types';

import { ModalDialog } from './ModalDialog';

/**
 * `DismissedModalDialog` represents a [`ModalDialog`](https://serenity-js.org/api/web/class/ModalDialog/) that has been dismissed
 * via [`ModalDialog.dismissNext`](https://serenity-js.org/api/web/class/ModalDialog/#dismissNext).
 *
 * ## Learn more
 * - [`ModalDialog`](https://serenity-js.org/api/web/class/ModalDialog/)
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
