import type { Answerable } from '@serenity-js/core';
import { MetaList } from '@serenity-js/core';

import type { PageElement } from './PageElement';
import { PageElementsLocator } from './PageElementsLocator';
import type { Selector } from './selectors';

/**
 * Uses the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to identify
 * a group of Web elements located by [`Selector`](https://serenity-js.org/api/web/class/Selector/).
 *
 * ## Learn more
 *
 * - [Page Element Query Language](https://serenity-js.org/handbook/web-testing/page-element-query-language)
 * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)}
 * - [`List`](https://serenity-js.org/api/core/class/List/)
 * - [`ChainableMetaQuestion`](https://serenity-js.org/api/core/interface/ChainableMetaQuestion/)
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
