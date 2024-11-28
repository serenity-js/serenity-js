import 'webdriverio';

import { type Discardable } from '@serenity-js/core';
import { AbsentModalDialog, AcceptedModalDialog, DismissedModalDialog, type ModalDialog, ModalDialogHandler } from '@serenity-js/web';

import { WebdriverProtocolErrorCode } from './WebdriverProtocolErrorCode.js';

/**
 * WebdriverIO-specific implementation of [`ModalDialogHandler`](https://serenity-js.org/api/web/class/ModalDialogHandler/),
 * used with the [WebDriver protocol](https://webdriver.io/docs/api/webdriver).
 *
 * @group Models
 */
export class WebdriverIOModalDialogHandler extends ModalDialogHandler implements Discardable {

    private readonly defaultHandler: (dialog: WebdriverIO.Dialog) => Promise<void> =
        async (dialog: WebdriverIO.Dialog) => {
            const message = dialog.message();

            await dialog.dismiss();

            this.modalDialog = new DismissedModalDialog(message);
        }

    private currentHandler: (dialog: WebdriverIO.Dialog) => Promise<void>;
    private dialog?: WebdriverIO.Dialog;

    constructor(private readonly browser: WebdriverIO.Browser) {
        super();

        this.currentHandler = this.defaultHandler;

        this.browser.on('dialog', this.onDialog);
    }

    private onDialog = this.tryToHandleDialog.bind(this);

    private async tryToHandleDialog(dialog: WebdriverIO.Dialog): Promise<void> {
        try {
            await this.currentHandler(dialog);
        }
        catch(error) {
            if (error.name === WebdriverProtocolErrorCode.UnexpectedAlertOpenError) {
                await dialog.dismiss();
                return;
            }

            if (error.message.includes(WebdriverProtocolErrorCode.NoSuchAlertError)) {
                this.modalDialog = new AbsentModalDialog();
                return;
            }

            throw error;
        }
    }

    async acceptNext(): Promise<void> {
        this.currentHandler = async (dialog: WebdriverIO.Dialog) => {
            const message = dialog.message();

            await this.browser.acceptAlert();

            this.modalDialog = new AcceptedModalDialog(message);
        };
    }

    async acceptNextWithValue(text: string | number): Promise<void> {
        this.currentHandler = async (dialog: WebdriverIO.Dialog) => {
            const message = dialog.message();
            await dialog.accept(String(text))

            this.modalDialog = new AcceptedModalDialog(message);
        };
    }

    async dismissNext(): Promise<void> {
        this.currentHandler = async (dialog: WebdriverIO.Dialog) => {
            const message = dialog.message();

            await dialog.dismiss();

            this.modalDialog = new DismissedModalDialog(message);
        }
    }

    async dismiss(): Promise<void> {
        if (! this.dialog) {
            return;
        }

        const message = this.dialog.message();
        await this.dialog.dismiss();
        this.modalDialog = new DismissedModalDialog(message);
    }

    async reset(): Promise<void> {
        this.modalDialog = new AbsentModalDialog();
        this.currentHandler = this.defaultHandler;
    }

    /**
     * @override
     */
    async last(): Promise<ModalDialog> {
        return this.modalDialog;
    }

    async discard(): Promise<void> {
        this.browser.off('dialog', this.onDialog);
    }
}
