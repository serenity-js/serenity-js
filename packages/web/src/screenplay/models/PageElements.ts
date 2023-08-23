import type { Answerable } from '@serenity-js/core';
import { MetaList } from '@serenity-js/core';

import type { PageElement } from './PageElement';
import { PageElementsLocator } from './PageElementsLocator';
import type { Selector } from './selectors';

/**
 * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to identify
 * a group of Web elements located by {@apilink Selector}.
 *
 * ## Learn more
 *
 * - [Page Element Query Language](/handbook/web-testing/page-element-query-language)
 * - {@apilink MetaList}
 * - {@apilink List}
 * - {@apilink ChainableMetaQuestion}
 *
 * @group Models
 */
export class PageElements<Native_Element_Type = any>
    extends MetaList<PageElement<Native_Element_Type>, PageElement<Native_Element_Type>>
{
    static located<NET>(selector: Answerable<Selector>): PageElements {
        return new PageElements(PageElementsLocator.fromDocumentRoot<NET>(selector));
    }
}
