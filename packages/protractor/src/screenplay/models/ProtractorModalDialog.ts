import { ModalDialog } from '@serenity-js/web';
import { ProtractorBrowser } from 'protractor';
import { error as errors } from 'selenium-webdriver';

import { promiseOf } from '../../promiseOf';

export class ProtractorModalDialog extends ModalDialog {

    constructor(private readonly browser: ProtractorBrowser) {
        super();
    }

    accept(): Promise<void> {
        return promiseOf(this.browser.switchTo().alert().accept());
    }

    dismiss(): Promise<void> {
        return promiseOf(this.browser.switchTo().alert().dismiss());
    }

    text(): Promise<string> {
        return promiseOf(this.browser.switchTo().alert().getText());
    }

    async enterValue(value: string | number | (string | number)[]): Promise<void> {
        const text = [].concat(value).join('');
        await promiseOf(this.browser.switchTo().alert().sendKeys(text));
        await promiseOf(this.browser.switchTo().alert().accept());
    }

    // todo: remove in favour of auto-wait in the above methods
    isPresent(): Promise<boolean> {
        return promiseOf(this.browser.switchTo().alert())
            .then(() => true, error => {

                // Based on:
                // https://github.com/SeleniumHQ/selenium/blob/941dc9c6b2e2aa4f701c1b72be8de03d4b7e996a/javascript/node/selenium-webdriver/lib/until.js#L107
                return error instanceof Error &&
                    ! (
                        error.name === errors.NoSuchAlertError.name
                        // XXX: Workaround for GeckoDriver error `TypeError: can't convert null
                        // to object`. For more details, see
                        // https://github.com/SeleniumHQ/selenium/pull/2137
                        || (error.name === errors.WebDriverError.name
                            && error.message === `can't convert null to object`)
                    );
            });
    }
}
