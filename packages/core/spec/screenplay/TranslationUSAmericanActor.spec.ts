import 'mocha';

import { expect } from 'chai';

import { Ensure, equals} from '../../../local-server/node_modules/@serenity-js/assertions/lib';
import { Actor, actorCalled, Cast, engage, Translate, Translation, translationDefaultLocale } from '../../src';
import { EnsureSame } from './EnsureSame';

class UsAmericanActor implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(Translate.using([translationOne, translationTwo], 'en_US'));
    }
}

const translationOne = {
    APPLE: {
        en_US: 'apple',
        de_DE: 'Apfel',
        de_CH: 'Apfel'
    }
};

const translationTwo = {
    HELLO: {
        en_US: 'Hello!',
        de_DE: 'Hallo!',
        de_CH: 'Grüezi!'
    }
};

describe('Multi Language Support / Translations US American Actor', () => {
    beforeEach(() => engage(new UsAmericanActor()));

    it('uses translations', () =>
        actorCalled('Travis').attemptsTo(
            EnsureSame(Translation.to('en_US').of('APPLE'), 'apple'),
            EnsureSame(Translation.to('en_US').of('HELLO'), 'Hello!'),
        ));

    it('throws an assertion errror when actual is not expected', () =>
        expect(actorCalled('Travis').attemptsTo(
            EnsureSame(Translation.to('en_US').of('APPLE'), 'Apfel')
        )).to.be.rejectedWith('Expected apple to be the same as Apfel'));

    it('uses translation with default locale', () =>
        actorCalled('Travis').attemptsTo(
            EnsureSame(Translation.of('APPLE'), 'apple'),
            EnsureSame(Translation.of('HELLO'), 'Hello!'),
        ));

    it('provides a sensible description with default locale', () =>
        expect(Translation.of('APPLE').toString()).to.equal('translation of APPLE with default locale'));

    it('provides a sensible description with given locale', () =>
        expect(Translation.to('en_US').of('APPLE').toString()).to.equal('translation of APPLE with locale en_US'));

    it('allows the default description to be overridden', () =>
        expect(Translation.of('APPLE').describedAs('overriden translation').toString())
            .to.equal('overriden translation'));

    it('get the default locale of actor Travis', () =>
        actorCalled('Travis').attemptsTo(
            Ensure.that('en_US', equals(translationDefaultLocale()))
        ));

});
