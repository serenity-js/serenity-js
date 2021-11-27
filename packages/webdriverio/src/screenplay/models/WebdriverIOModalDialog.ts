import { ModalDialog } from '@serenity-js/web';
import { Browser } from 'webdriverio';

export class WebdriverIOModalDialog extends ModalDialog {
    constructor(private readonly browser: Browser<'async'>) {
        super();
    }

    accept(): Promise<void> {
        return this.browser.acceptAlert();
    }

    dismiss(): Promise<void> {
        return this.browser.dismissAlert();
    }
    text(): Promise<string> {
        return this.browser.getAlertText();
    }

    async enterValue(value: string | number | (string | number)[]): Promise<void> {
        const text = [].concat(value).join('');

        await this.browser.sendAlertText(text);

        // Puppeteer auto-accepts the dialog upon sendAlertText
        // other implementations require the dialog to be closed
        if (! this.browser.isDevTools) {
            await this.browser.acceptAlert();
        }
    }

    isPresent(): Promise<boolean> {
        return this.browser.getAlertText()
            .then(() => true, error => {
                if (error && (
                    error.name === 'no such alert'
                    || error.message.startsWith('no such alert')
                )) {
                    return false;
                }

                throw error;
            });
    }
}
