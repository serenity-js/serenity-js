import type { Answerable, AnswersQuestions, ChainableMetaQuestion, UsesAbilities } from '@serenity-js/core';
import { MetaList, Question, the } from '@serenity-js/core';

import type { PageElement } from './PageElement.js';
import { PageElementsLocator } from './PageElementsLocator.js';
import type { Selector } from './selectors/index.js';

/**
 * Represents a single child element located within a parent element,
 * preserving `.of()` composability through the chain.
 *
 * When `.of(context)` is called, the entire chain is rescoped:
 * the parent is resolved relative to the new context.
 *
 * @package
 */
export class ChainedElementQuestion<Native_Element_Type = any>
    extends Question<Promise<PageElement<Native_Element_Type>>>
    implements ChainableMetaQuestion<PageElement<Native_Element_Type>, Question<Promise<PageElement<Native_Element_Type>>>>
{
    constructor(
        private readonly parent: Answerable<PageElement<Native_Element_Type>> & ChainableMetaQuestion<PageElement<Native_Element_Type>, any>,
        private readonly selector: Answerable<Selector>,
    ) {
        super(the`${ parent }.element(${ selector })`);
    }

    of(context: Answerable<PageElement<Native_Element_Type>>): ChainedElementQuestion<Native_Element_Type> {
        return new ChainedElementQuestion<Native_Element_Type>(
            this.parent.of(context),
            this.selector,
        );
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<PageElement<Native_Element_Type>> {
        const parentElement = await actor.answer(this.parent);
        const selector = await actor.answer(this.selector);
        return parentElement.element(selector);
    }

    /**
     * Locates a single descendant element within this element.
     */
    element(selector: Answerable<Selector>): ChainedElementQuestion<Native_Element_Type> {
        return new ChainedElementQuestion<Native_Element_Type>(this, selector);
    }

    /**
     * Locates all descendant elements within this element, returning a PEQL collection.
     */
    elements(selector: Answerable<Selector>): MetaList<PageElement<Native_Element_Type>, PageElement<Native_Element_Type>> {
        return new MetaList<PageElement<Native_Element_Type>, PageElement<Native_Element_Type>>(
            new ChainedElementsLocator<Native_Element_Type>(this, selector),
        );
    }
}

/**
 * Locates multiple child elements within a parent ChainedElementQuestion,
 * preserving `.of()` composability.
 *
 * @package
 */
class ChainedElementsLocator<Native_Element_Type = any>
    extends Question<Promise<Array<PageElement<Native_Element_Type>>>>
    implements ChainableMetaQuestion<PageElement<Native_Element_Type>, Question<Promise<Array<PageElement<Native_Element_Type>>>>>
{
    constructor(
        private readonly parent: ChainedElementQuestion<Native_Element_Type>,
        private readonly selector: Answerable<Selector>,
    ) {
        super(the`${ parent }.elements(${ selector })`);
    }

    of(context: Answerable<PageElement<Native_Element_Type>>): ChainedElementsLocator<Native_Element_Type> {
        return new ChainedElementsLocator<Native_Element_Type>(
            this.parent.of(context),
            this.selector,
        );
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Array<PageElement<Native_Element_Type>>> {
        const parentElement = await actor.answer(this.parent);
        const selector = await actor.answer(this.selector);
        return parentElement.elements(selector);
    }
}
