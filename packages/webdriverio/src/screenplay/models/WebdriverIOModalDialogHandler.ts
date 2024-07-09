import 'webdriverio';

import type { ModalDialog} from '@serenity-js/web';
import { AbsentModalDialog, AcceptedModalDialog, DismissedModalDialog, ModalDialogHandler } from '@serenity-js/web';

import type { WebdriverIOErrorHandler } from './WebdriverIOErrorHandler.js';
import { WebdriverProtocolErrorCode } from './WebdriverProtocolErrorCode.js';

/**
 * WebdriverIO-specific implementation of [`ModalDialogHandler`](https://serenity-js.org/api/web/class/ModalDialogHandler/),
 * used with the [WebDriver protocol](https://webdriver.io/docs/api/webdriver).
 *
 * @group Models
 */
export class WebdriverIOModalDialogHandler extends ModalDialogHandler {

    private readonly defaultHandler: () => Promise<void> =
        async () => {
            const message = await this.browser.getAlertText();

            await this.browser.dismissAlert();

            this.modalDialog = new DismissedModalDialog(message);
        }

    private currentHandler: () => Promise<void>;

    constructor(
        private readonly browser: WebdriverIO.Browser,
        private readonly errorHandler: WebdriverIOErrorHandler,
    ) {
        super();

        this.currentHandler = this.defaultHandler;

        this.errorHandler.setHandlerFor(WebdriverProtocolErrorCode.UnexpectedAlertOpenError, error_ => this.tryToHandleDialog());
    }

    async tryToHandleDialog(): Promise<void> {
        try {
            await this.currentHandler()
        }
        catch (error) {
            if (error.name === WebdriverProtocolErrorCode.NoSuchAlertError) {
                this.modalDialog = new AbsentModalDialog();
                return;
            }
            throw error;
        }
    }

    async acceptNext(): Promise<void> {
        this.currentHandler = async () => {
            const message = await this.browser.getAlertText();

            await this.browser.acceptAlert();

            this.modalDialog = new AcceptedModalDialog(message);
        };
    }

    async acceptNextWithValue(text: string | number): Promise<void> {
        this.currentHandler = async () => {
            await this.browser.sendAlertText(String(text));
            const message = await this.browser.getAlertText();

            await this.browser.acceptAlert();

            this.modalDialog = new AcceptedModalDialog(message);
        };
    }

    async dismissNext(): Promise<void> {
        this.currentHandler = async () => {
            const message = await this.browser.getAlertText();

            await this.browser.dismissAlert();

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

        if (this.modalDialog instanceof AbsentModalDialog) {
            await this.tryToHandleDialog();
        }

        return this.modalDialog;
    }
}
