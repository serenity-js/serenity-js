import type { Answerable, MetaList, Question } from '@serenity-js/core';
import { List } from '@serenity-js/core';

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
export class PageElements {
    static located<NET>(selector: Answerable<Selector>): MetaList<PageElement<NET>, PageElement<NET>> {
        return List.of<PageElement<NET>, PageElement<NET>, Question<Promise<Array<PageElement<NET>>>>>(
            PageElementsLocator.fromDocumentRoot<NET>(selector)
        );
    }
}
