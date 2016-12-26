import * as webdriver from 'selenium-webdriver';

export function fakeBrowserLocating(element: webdriver.WebElement): any {
    return { element: _ => element };
}
