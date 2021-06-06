import { Answerable, AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';

import { BrowseTheWeb } from '../abilities';
import { withAnswerOf } from '../withAnswerOf';

// todo: it might be better to swap the order of arguments
//  - Attribute.called('href').of(link) to make it work with ArrayListFilter

export class Attribute extends Question<Promise<string>> {
    /**
     * @param {Question<ElementFinder> | ElementFinder} target
     * @returns {AttributeBuilder}
     */
    static of(target: Question<ElementFinder> | ElementFinder): AttributeBuilder {
        return {
            called: (name: Answerable<string>) => new Attribute(target, name),
        };
    }

    constructor(
        private readonly target: Question<ElementFinder> | ElementFinder,
        private readonly name: Answerable<string>,
    ) {
        super(formatted `the value of the ${ name } attribute of ${ target}`);
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return actor.answer(this.name)
            .then(name => withAnswerOf(actor, this.target, (elf: ElementFinder) =>
                elf.getAttribute(name).then(value => {
                    return value !== null               // workaround for bug in Chromium 91 - https://bugs.chromium.org/p/chromium/issues/detail?id=1205107&start=300
                        ? value
                        : BrowseTheWeb.as(actor).executeFunction(
                            /* istanbul ignore next */
                            function getAttribute(webElement, attributeName: string) {
                                // eslint-disable-next-line no-var
                                var value = (webElement[attributeName] || webElement.getAttribute(attributeName));
                                if (value !== null && value !== undefined) {
                                    return '' + value;
                                }
                                return value;
                            },
                            elf.getWebElement(),
                            name
                        );
                })
            ));
    }
}

interface AttributeBuilder {
    called(name: Answerable<string>): Attribute;
}
