import { protractor } from 'protractor';

export function ensureCurrentBrowserIsNot(...unwanted: string[]): any {
    return function() {
        return protractor.browser.driver.getCapabilities()
            .then(capabilities => capabilities.get('browserName'))
            .then(name => {

                unwanted.forEach(unwantedBrowser => {
                    const pattern = new RegExp(`${unwantedBrowser}`);

                    if (pattern.test(name)) {
                        this.skip();
                    }
                });
            });
    };
}
