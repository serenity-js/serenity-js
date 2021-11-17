import { ByCss } from './ByCss';
import { ByCssContainingText } from './ByCssContainingText';
import { ById } from './ById';
import { ByLinkText } from './ByLinkText';
import { ByName } from './ByName';
import { ByPartialLinkText } from './ByPartialLinkText';
import { ByTagName } from './ByTagName';
import { ByXPath } from './ByXPath';
import { PageElementLocation } from './PageElementLocation';

export class PageElementLocations {
    css(value: string): PageElementLocation {
        return new ByCss(value);
    }

    cssContainingText(selector: string, text: string): PageElementLocation {
        return new ByCssContainingText(selector, text);
    }

    id(value: string): PageElementLocation {
        return new ById(value);
    }

    linkText(value: string): PageElementLocation {
        return new ByLinkText(value);
    }

    partialLinkText(value: string): PageElementLocation {
        return new ByPartialLinkText(value);
    }

    tagName(value: string): PageElementLocation {
        return new ByTagName(value);
    }

    name(value: string): PageElementLocation {
        return new ByName(value);
    }

    xPath(value: string): PageElementLocation {
        return new ByXPath(value);
    }
}
