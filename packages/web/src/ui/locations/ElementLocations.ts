import { ByCss } from './ByCss';
import { ByCssContainingText } from './ByCssContainingText';
import { ById } from './ById';
import { ByLinkText } from './ByLinkText';
import { ByName } from './ByName';
import { ByPartialLinkText } from './ByPartialLinkText';
import { ByTagName } from './ByTagName';
import { ByXPath } from './ByXPath';
import { ElementLocation } from './ElementLocation';

export class ElementLocations {
    css(value: string): ElementLocation {
        return new ByCss(value);
    }

    cssContainingText(selector: string, text: string): ElementLocation {
        return new ByCssContainingText(selector, text);
    }

    id(value: string): ElementLocation {
        return new ById(value);
    }

    linkText(value: string): ElementLocation {
        return new ByLinkText(value);
    }

    partialLinkText(value: string): ElementLocation {
        return new ByPartialLinkText(value);
    }

    tagName(value: string): ElementLocation {
        return new ByTagName(value);
    }

    name(value: string): ElementLocation {
        return new ByName(value);
    }

    xPath(value: string): ElementLocation {
        return new ByXPath(value);
    }
}
