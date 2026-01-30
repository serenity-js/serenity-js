import { describe, it } from 'mocha';

import { Config } from '../../src/io';
import { expect } from '../expect';

describe('Config', () => {

    describe('when wrapping a plain-old configuration object', () => {

        const example = {
            require: 'spec/file.ts',
            empty: undefined,
        }

        it('enables access to its fields', () => {
            const config = new Config(example);

            expect(config.get('require')).to.equal(example.require);
        });

        it('tells if a given field exists, but is undefined', () => {
            const config = new Config(example);

            expect(config.has('empty')).to.equal(true);
        });

        it(`tells if a given field doesn't exist`, () => {
            const config = new Config<any>(example);

            expect(config.has('invalid')).to.equal(false);
        });

        it(`provides access to object's keys`, () => {
            const config = new Config(example);

            expect(config.keys()).to.deep.equal([ 'require', 'empty' ]);
        });
    });

    describe('when transforming the values', () => {

        it('transforms values using transformation functions provided for each field', () => {
            const config = new Config({ file: 'name.ts', dir: 'projects' })
                .where('file', value => value.replace('.ts', '.html'))
                .where('dir', value => 'websites');

            expect(config.get('file')).to.equal('name.html');
            expect(config.get('dir')).to.equal('websites');
        });

        describe('conditionally', () => {

            it('transforms a value when a condition is met', () => {
                const config = new Config({ name: 'Alice'  })
                    .whereIf(true, 'name', value => value.toUpperCase());

                expect(config.get('name')).to.equal('ALICE');
            });

            it('does not transform the value when a condition is not met', () => {
                const config = new Config({ name: 'Alice'  })
                    .whereIf(false, 'name', value => value.toUpperCase());

                expect(config.get('name')).to.equal('Alice');
            });
        });

        describe('getAsList', () => {
            describe('returns an empty list when the value', () => {

                it('is undefined', () => {
                    const config = new Config({ empty: undefined });

                    expect(config.getAsList('empty')).to.deep.equal([]);
                });

                it('is null', () => {
                    const config = new Config({ null: null });

                    expect(config.getAsList('null')).to.deep.equal([]);
                });

                it(`does not exist`, () => {
                    const config = new Config<any>({ });

                    expect(config.getAsList('invalid')).to.deep.equal([]);
                });
            });

            describe('returns a list when the value', () => {

                it('is already a list', () => {
                    const config = new Config({ numbers: [ 1, 2, 3 ] });

                    expect(config.getAsList('numbers')).to.deep.equal([ 1, 2, 3 ]);
                });

                it('is not a list', () => {
                    const config = new Config({ numbers: 1 });

                    expect(config.getAsList('numbers')).to.deep.equal([ 1 ]);
                });

                it('respects the transformation function, if it is defined', () => {
                    const config = new Config({ numbers: 1 })
                        .where('numbers', value => value * 2);

                    expect(config.getAsList('numbers')).to.deep.equal([ 2 ]);
                });
            });
        });
    });

    describe('when extracting the configuration object', () => {

        it('returns the value equal to the underlying config object, when no transformations are used', () => {

            const config = new Config({ numbers: 1, names: ['Alice'] });

            expect(config.object()).to.deep.equal({ numbers: 1, names: ['Alice'] });
        });

        it('applies any transformations', () => {

            const config = new Config({ numbers: 1, names: ['Alice'] })
                .where('numbers', value => value * 2)
                .where('names', values => values.map(value => value.toUpperCase()));

            expect(config.object()).to.deep.equal({ numbers: 2, names: ['ALICE'] });
        });
    });
});
