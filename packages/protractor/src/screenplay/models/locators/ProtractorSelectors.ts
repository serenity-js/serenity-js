import { f, LogicError } from '@serenity-js/core';
import { ByCss, ByCssContainingText, ByDeepCss, ById, ByTagName, ByXPath, type Selector } from '@serenity-js/web';
import * as protractor from 'protractor';

export class ProtractorSelectors {
    static selectorFrom(nativeLocator: protractor.Locator & { using?: string, value: string }): Selector {

        switch (true) {
            case nativeLocator.using === 'xpath':
                return new ByXPath(nativeLocator.value);

            case nativeLocator.toString().startsWith('by.shadowDomCss'): {
                const [ , selector ] = nativeLocator.toString().match(/by\.shadowDomCss\("(.*)"\)$/);
                return new ByDeepCss(selector);
            }

            case nativeLocator.toString().startsWith('by.cssContainingText'): {
                // https://github.com/angular/protractor/blob/4bc80d1a459542d883ea9200e4e1f48d265d0fda/lib/locators.ts#L428
                const [ , selector, text ] = nativeLocator.toString().match(/by\.cssContainingText\("(.*)", "(.*)"\)$/);
                return new ByCssContainingText(selector, text);
            }

            case nativeLocator.using === 'css selector' && nativeLocator.value.startsWith('*[id='): {
                const [ , selector ] = nativeLocator.value.match(/\*\[id="(.*)"]$/)
                return new ById(selector);
            }

            // case nativeLocator.using === 'css selector':
            default:
                return new ByCss(nativeLocator.value);
        }
    }

    static locatorFrom(selector: Selector): protractor.Locator {
        if (selector instanceof ByCss) {
            return protractor.by.css(selector.value);
        }

        if (selector instanceof ByDeepCss) {
            if (! protractor.by.shadowDomCss) {
                throw new LogicError(`By.deepCss() requires query-selector-shadow-dom plugin, which Serenity/JS ProtractorFrameworkAdapter registers by default. If you're using Serenity/JS without ProtractorFrameworkAdapter, please register the plugin yourself.`)
            }

            return protractor.by.shadowDomCss(selector.value.replace('>>>', '').trim());
        }

        if (selector instanceof ByCssContainingText) {
            return protractor.by.cssContainingText(selector.value, selector.text);
        }

        if (selector instanceof ById) {
            return protractor.by.id(selector.value);
        }

        if (selector instanceof ByTagName) {
            return protractor.by.tagName(selector.value);
        }

        if (selector instanceof ByXPath) {
            return protractor.by.xpath(selector.value);
        }

        throw new LogicError(f `${ selector } is not supported by ${ this.constructor.name }`);
    }
}
