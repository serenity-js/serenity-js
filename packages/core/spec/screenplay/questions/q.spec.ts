import { beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { q, Question, Serenity } from '../../../src';
import type { Actor } from '../../../src/screenplay';
import type { Cast } from '../../../src/stage';
import { expect } from '../../expect';

describe('q', () => {

    let serenity: Serenity,
        Quentin: Actor;

    class Actors implements Cast {
        prepare(actor: Actor): Actor {
            return actor;
        }
    }

    beforeEach(() => {
        serenity = new Serenity();

        serenity.configure({
            crew: [ ],
            actors: new Actors(),
        });

        Quentin = serenity.theActorCalled('Quentin');
    });

    it('returns the original string value if no parameters are provided', () => {
        const question = q`some value`;

        return expect(Quentin.answer(question)).to.eventually.equal('some value');
    });

    given([
        { description: 'string',                    value: 'World' },
        { description: 'Promise<string>',           value: Promise.resolve('World') },
        { description: 'Question<string>',          value: Question.about('name', actor => 'World') },
        { description: 'Question<Promise<string>>', value: Question.about('name', actor => Promise.resolve('World')) },
    ]).
    it('should inject an answer to an Answerable<string> into the template', ({ value }) => {
        const question = q `Hello ${ value }!`;

        return expect(Quentin.answer(question)).to.eventually.equal('Hello World!')
    });

    given([
        { description: 'number',                    value: 42 },
        { description: 'Promise<number>',           value: Promise.resolve(42) },
        { description: 'Question<number>',          value: Question.about('value', actor => 42) },
        { description: 'Question<Promise<number>>', value: Question.about('value', actor => Promise.resolve(42)) },
    ]).
    it('should inject an answer to an Answerable<number> into the template', ({ value }) => {
        const question = q `The answer is: ${ value }!`;

        return expect(Quentin.answer(question)).to.eventually.equal('The answer is: 42!')
    });

    it(`should inject answers to multiple Answerables into the template`, async () => {
        const
            baseUrl = Question.about('url', actor => 'http://127.0.0.1:8000'),
            itemId  = Question.about('itemId', actor => 5);

        const question = q `${ baseUrl }/api/items/${ itemId }`;

        const answer    = await Quentin.answer(question);
        const toString  = question.toString();

        expect(answer).to.equal('http://127.0.0.1:8000/api/items/5');
        expect(toString).to.equal('{url}/api/items/{itemId}');
    });

    it('provides a sensible description of the question being asked', () => {
        const question = q `/products/${ 1 }/attributes/${ Promise.resolve(2) }`;

        return expect(question.toString()).to.equal('/products/1/attributes/{Promise}')
    });

    it('can have the default description overridden', () => {
        const question = q `/products/${ 1 }/attributes/${ Promise.resolve(2) }`.describedAs('/products/:productId/attributes/:attributeId');

        return expect(question.toString()).to.equal('/products/:productId/attributes/:attributeId')
    });
});
