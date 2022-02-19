import 'mocha';

import { expect } from 'chai';

import { contain, Ensure, equals} from '../../../local-server/node_modules/@serenity-js/assertions/lib';
import { Actor, actorCalled, Cast, engage, Translate, Translation, translationDefaultLocale,Translations } from '../../src';
import { EnsureSame } from './EnsureSame';

class SwissGermanActors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(Translate.using([translationOne, translationTwo], 'de_CH'));
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

describe('Support translations for a Swiss German actor', () => {
    beforeEach(() => engage(new SwissGermanActors()));

    it('uses translation', () =>
        actorCalled('Heidi').attemptsTo(
            EnsureSame(Translation.to('de_CH').of('APPLE'), 'Apfel'),
            EnsureSame(Translation.to('de_CH').of('HELLO'), 'Grüezi!'),
        ));

    it('uses translation with default locale', () =>
        actorCalled('Heidi').attemptsTo(
            EnsureSame(Translation.of('APPLE'), 'Apfel'),
            EnsureSame(Translation.of('HELLO'), 'Grüezi!'),
        ));

    it('throws an assertion error when actual is not expected', () =>
        expect(actorCalled('Heidi').attemptsTo(
            EnsureSame(Translation.to('de_CH').of('APPLE'), 'apple')
        )).to.be.rejectedWith('Expected Apfel to be the same as apple'));

    it('throws an assertion error if translation string is not provided', () =>
        expect(actorCalled('Heidi').attemptsTo(
            EnsureSame(Translation.to('de_CH'), 'apple')
        )).to.be.rejectedWith('Expected undefined to be the same as apple'));

    it('can translate arrays', () =>
        actorCalled('Heidi').attemptsTo(
            Ensure.that(Translations.of(['APPLE', 'HELLO']), contain('Apfel'))
        ));

    it('get the default locale of actor', () =>
        actorCalled('Heidi').attemptsTo(
            Ensure.that('de_CH', equals(translationDefaultLocale()))
        ));
});
