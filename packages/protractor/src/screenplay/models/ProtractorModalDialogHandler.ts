import { AbsentModalDialog, AcceptedModalDialog, DismissedModalDialog, ModalDialog, ModalDialogHandler } from '@serenity-js/web';
import * as protractor from 'protractor';
import { error as errors } from 'protractor';

import { promised } from '../promised';
import { ProtractorErrorHandler } from './ProtractorErrorHandler';

/**
 * Protractor-specific implementation of {@apilink ModalDialogHandler}.
 *
 * @group Models
 */
export class ProtractorModalDialogHandler extends ModalDialogHandler {

    private readonly defaultHandler: () => Promise<void> =
        async () => {
            const message = await promised(this.browser.switchTo().alert().getText());

            await promised(this.browser.switchTo().alert().dismiss());

            this.modalDialog = new DismissedModalDialog(message);
        }

    private currentHandler: () => Promise<void>;

    constructor(
        private readonly browser: protractor.ProtractorBrowser,
        private readonly errorHandler: ProtractorErrorHandler,
    ) {
        super();

        this.currentHandler = this.defaultHandler;

        this.errorHandler.setHandlerFor(errors.UnexpectedAlertOpenError.name, error_ => this.tryToHandleDialog());
    }

    async tryToHandleDialog(): Promise<void> {
        try {
            await this.currentHandler()
        }
        catch (error) {
            if (error.name === errors.NoSuchAlertError.name) {
                this.modalDialog = new AbsentModalDialog();
                return;
            }
            throw error;
        }
    }

    async acceptNext(): Promise<void> {
        this.currentHandler = async () => {
            const message = await promised(this.browser.switchTo().alert().getText());

            await promised(this.browser.switchTo().alert().accept());

            this.modalDialog = new AcceptedModalDialog(message);
        };
    }

    async acceptNextWithValue(text: string | number): Promise<void> {
        this.currentHandler = async () => {
            await promised(this.browser.switchTo().alert().sendKeys(String(text)));
            const message = await promised(this.browser.switchTo().alert().getText());

            await promised(this.browser.switchTo().alert().accept());

            this.modalDialog = new AcceptedModalDialog(message);
        };
    }

    async dismissNext(): Promise<void> {
        this.currentHandler = async () => {
            const message = await promised(this.browser.switchTo().alert().getText());

            await promised(this.browser.switchTo().alert().dismiss());

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
