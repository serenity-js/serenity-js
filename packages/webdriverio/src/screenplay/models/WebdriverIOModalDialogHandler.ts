import 'webdriverio';

import type { ModalDialog } from '@serenity-js/web';
import { AbsentModalDialog, AcceptedModalDialog, DismissedModalDialog, ModalDialogHandler } from '@serenity-js/web';

import { WebdriverProtocolErrorCode } from './WebdriverProtocolErrorCode.js';

/**
 * WebdriverIO-specific implementation of [`ModalDialogHandler`](https://serenity-js.org/api/web/class/ModalDialogHandler/),
 * used with the [WebDriver protocol](https://webdriver.io/docs/api/webdriver).
 *
 * @group Models
 */
export class WebdriverIOModalDialogHandler extends ModalDialogHandler {

    private readonly defaultHandler: (dialog: WebdriverIO.Dialog) => Promise<void> =
        async (dialog: WebdriverIO.Dialog) => {
            const message = dialog.message();

            await dialog.dismiss();

            this.modalDialog = new DismissedModalDialog(message);
        }

    private currentHandler: (dialog: WebdriverIO.Dialog) => Promise<void>;

    constructor(private readonly browser: WebdriverIO.Browser) {
        super();

        this.currentHandler = this.defaultHandler;

        this.browser.on('dialog', async dialog => {
            try {
                console.log('>>  dialog: currentHandler(dialog) start', this.currentHandler.toString())
                await this.currentHandler(dialog);
                console.log('>>  dialog: currentHandler(dialog) end')
            }
            catch(error) {
                console.error('>>  dialog: currentHandler(dialog) error', { name: error.name, message: error.message, error })
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
        })
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
}
