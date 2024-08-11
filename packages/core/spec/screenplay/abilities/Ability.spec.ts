import { describe, it } from 'mocha';

import { Ability } from '../../../src';
import { expect } from '../../expect';

describe('Ability', () => {

    describe('abilityType()', () => {

        describe('for classes inheriting directly from Ability', () => {

            it('returns the class itself when invoked on an instance', () => {

                class MyAbility extends Ability {}

                const abilityType = new MyAbility().abilityType();

                expect(abilityType).to.equal(MyAbility);
            });

            it('returns the class itself when invoked statically', () => {

                class MyAbility extends Ability {}

                const abilityType = MyAbility.abilityType();

                expect(abilityType).to.equal(MyAbility);
            });
        });

        describe('for classes inheriting indirectly from Ability', () => {

            it('returns the ancestor class inheriting directly from the Ability ', () => {
                class MyAbility extends Ability {}
                class MySpecialisedAbility extends MyAbility {}

                const abilityType = new MySpecialisedAbility().abilityType();

                expect(abilityType).to.equal(MyAbility);
            });
        });
    });

    describe('toJSON()', () => {

        it('returns a reporting-friendly representation of the Ability', () => {
            class MyAbility extends Ability {}
            class MySpecialisedAbility extends MyAbility {}

            const json = new MySpecialisedAbility().toJSON();

            expect(json).to.deep.equal({
                type: MyAbility.name,
                class: MySpecialisedAbility.name,
            });
        });
    });
});
