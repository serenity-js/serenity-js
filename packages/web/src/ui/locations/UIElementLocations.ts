import { ByCss } from './ByCss';
import { ByCssContainingText } from './ByCssContainingText';
import { ById } from './ById';
import { ByLinkText } from './ByLinkText';
import { ByName } from './ByName';
import { ByPartialLinkText } from './ByPartialLinkText';
import { ByTagName } from './ByTagName';
import { ByXPath } from './ByXPath';
import { UIElementLocation } from './UIElementLocation';

export class UIElementLocations {
    css(value: string): UIElementLocation {
        return new ByCss(value);
    }

    cssContainingText(selector: string, text: string): UIElementLocation {
        return new ByCssContainingText(selector, text);
    }

    id(value: string): UIElementLocation {
        return new ById(value);
    }

    linkText(value: string): UIElementLocation {
        return new ByLinkText(value);
    }

    partialLinkText(value: string): UIElementLocation {
        return new ByPartialLinkText(value);
    }

    tagName(value: string): UIElementLocation {
        return new ByTagName(value);
    }

    name(value: string): UIElementLocation {
        return new ByName(value);
    }

    xPath(value: string): UIElementLocation {
        return new ByXPath(value);
    }
}
