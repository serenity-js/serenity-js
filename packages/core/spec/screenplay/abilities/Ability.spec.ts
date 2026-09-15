import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { Ability } from '../../../src';
import { expect } from '../../expect';

describe('Ability', () => {

    describe('constructor', () => {

        it('allows a direct subclass to be instantiated', () => {
            class MyAbility extends Ability {}

            const ability = new MyAbility();

            expect(ability).to.be.instanceOf(MyAbility);
        });

        it('allows a subclass with its own parameterised constructor to be instantiated', () => {
            class QueryDatabase extends Ability {
                constructor(public readonly client: { connected: boolean }) {
                    super();
                }
            }

            const ability = new QueryDatabase({ connected: true });

            expect(ability.client).to.deep.equal({ connected: true });
        });

        describe('brands instances so that they', () => {

            it('are recognised as an Ability', () => {
                class MyAbility extends Ability {}

                expect(new MyAbility()).to.be.instanceOf(Ability);
            });

            it('are recognised as an Ability when inheriting indirectly', () => {
                class MyAbility extends Ability {}
                class MySpecialisedAbility extends MyAbility {}

                expect(new MySpecialisedAbility()).to.be.instanceOf(Ability);
                expect(new MySpecialisedAbility()).to.be.instanceOf(MyAbility);
            });

            it('are recognised as an Ability when the subclass defines its own constructor', () => {
                class QueryDatabase extends Ability {
                    constructor(public readonly client: object) {
                        super();
                    }
                }

                expect(new QueryDatabase({})).to.be.instanceOf(Ability);
                expect(new QueryDatabase({})).to.be.instanceOf(QueryDatabase);
            });
        });

        describe('does not mistake for an Ability', () => {

            given([
                { description: 'null',           value: null      },
                { description: 'undefined',      value: undefined },
                { description: 'a plain object', value: { }       },
                { description: 'a number',       value: 42        },
                { description: 'a string',       value: 'ability' },
            ]).
            it('a value that is', ({ value }) => {
                expect(value instanceof Ability).to.equal(false);
            });
        });
    });

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
