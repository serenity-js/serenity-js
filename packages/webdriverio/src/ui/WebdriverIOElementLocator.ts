import { UIElementLocator } from '@serenity-js/web';

export class WebdriverIOElementLocator<T> extends UIElementLocator<T> {
    constructor(private readonly fn: (selector: string) => Promise<T>) {
        super();
        this.whenCss(selector => this.fn(selector))
            .whenId(selector  => this.fn(`#${selector}`))
            .whenLinkText(selector => this.fn(`=${selector}`))
            .whenPartialLinkText(selector  => this.fn(`*=${selector}`))
            .whenTagName(selector  => this.fn(`<${selector} />`))
            .whenXPath(selector  => this.fn(`#${selector}`))
    }
}
