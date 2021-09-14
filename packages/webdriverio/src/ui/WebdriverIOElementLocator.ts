import { ByCss, ByCssContainingText, ById, ByLinkText, ByName, ByPartialLinkText, ByTagName, ByXPath, UIElementLocator } from '@serenity-js/web';

export class WebdriverIOElementLocator<T> extends UIElementLocator<T> {
    constructor(private readonly fn: (selector: string) => Promise<T>) {
        super();
        this.when(ByCss,                location =>  this.fn(location.value))
            .when(ByCssContainingText,  location =>  this.fn(`${ location.value }*=${ location.text }`))
            .when(ById,                 location =>  this.fn(`#${ location.value }`))
            .when(ByName,               location =>  this.fn(`[name="${ location.value }"]`))
            .when(ByLinkText,           location =>  this.fn(`=${ location.value }`))
            .when(ByPartialLinkText,    location =>  this.fn(`*=${ location.value }`))
            .when(ByTagName,            location => this.fn(`<${ location.value } />`))
            .when(ByXPath,              location => this.fn(`#${ location.value }`))
    }
}
