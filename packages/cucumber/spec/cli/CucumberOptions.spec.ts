import 'mocha';

import { expect } from '@integration/testing-tools';
import { Version } from '@serenity-js/core/lib/io';
import { given } from 'mocha-testdata';
import { CucumberOptions } from '../../src/cli/CucumberOptions';

describe('CucumberOptions', () => {

    describe('when used to produce command line arguments for Cucumber CLI', () => {

        given([
            new Version('1.0.0'),
            new Version('2.0.0'),
            new Version('3.0.0'),
            new Version('4.0.0'),
            new Version('5.0.0'),
        ]).
        it('returns no additional arguments when the config is empty', (majorVersion: Version) => {
            const options = new CucumberOptions({});

            expect(options.asArgumentsForCucumber(majorVersion)).to.deep.equal(['node', 'cucumber-js']);
        });

        describe('tags', () => {

            given([
                new Version('2.0.0'),
                new Version('3.0.0'),
                new Version('4.0.0'),
                new Version('5.0.0'),
            ]).
            it('converts a list of tags into a Cucumber expression for Cucumber 2.x and newer', (majorVersion: Version) => {
                const options = new CucumberOptions({
                    tags: [
                        '@smoke-test',
                        '~@wip',
                        'not @failing and ~@flaky',
                    ],
                });

                expect(options.asArgumentsForCucumber(majorVersion)).to.deep.equal([
                    'node', 'cucumber-js', '--tags', '@smoke-test', '--tags', 'not @wip', '--tags', 'not @failing and not @flaky',
                ]);
            });

            it('passes the tags individually to Cucumber 1.x', () => {
                const options = new CucumberOptions({
                    tags: [
                        '@smoke-test',
                        '~@wip',
                        '~@failing',
                    ],
                });

                expect(options.asArgumentsForCucumber(new Version('1.0.0'))).to.deep.equal([
                    'node', 'cucumber-js', '--tags', '@smoke-test', '--tags', '~@wip', '--tags', '~@failing',
                ]);
            });
        });

        describe('flags', () => {

            given([
                { description: 'backtrace off',    option: 'backtrace',    state: false,  expected: '--no-backtrace'   },
                { description: 'backtrace on',     option: 'backtrace',    state: true,   expected: '--backtrace'      },
                { description: 'dry-run off',      option: 'dry-run',      state: false,  expected: '--no-dry-run'     },
                { description: 'dry-run on',       option: 'dry-run',      state: true,   expected: '--dry-run'        },
                { description: 'exit off',         option: 'exit',         state: false,  expected: '--no-exit'        },
                { description: 'exit on',          option: 'exit',         state: true,   expected: '--exit'           },
                { description: 'fail-fast off',    option: 'fail-fast',    state: false,  expected: '--no-fail-fast'   },
                { description: 'fail-fast on',     option: 'fail-fast',    state: true,   expected: '--fail-fast'      },
                { description: 'strict off',       option: 'strict',       state: false,  expected: '--no-strict'      },
                { description: 'strict on',        option: 'strict',       state: true,   expected: '--strict'         },
                { description: 'colors off',       option: 'colors',       state: false,  expected: '--no-colors'      },
                { description: 'colors on',        option: 'colors',       state: true,   expected: '--colors'         },
            ]).
            it('correctly interprets boolean options', ({ option, state, expected }) => {
                const options = new CucumberOptions({
                    [option]: state,
                });

                expect(options.asArgumentsForCucumber(new Version('5.0.0'))).to.deep.equal([
                    'node', 'cucumber-js', expected,
                ]);
            });

            given([
                { description: 'backtrace off',    option: 'no-backtrace',    state: true,  expected: '--no-backtrace'   },
                { description: 'backtrace on',     option: 'no-backtrace',    state: false, expected: '--backtrace'      },
                { description: 'dry-run off',      option: 'no-dry-run',      state: true,  expected: '--no-dry-run'     },
                { description: 'dry-run on',       option: 'no-dry-run',      state: false, expected: '--dry-run'        },
                { description: 'exit off',         option: 'no-exit',         state: true,  expected: '--no-exit'        },
                { description: 'exit on',          option: 'no-exit',         state: false, expected: '--exit'           },
                { description: 'fail-fast off',    option: 'no-fail-fast',    state: true,  expected: '--no-fail-fast'   },
                { description: 'fail-fast on',     option: 'no-fail-fast',    state: false, expected: '--fail-fast'      },
                { description: 'strict off',       option: 'no-strict',       state: true,  expected: '--no-strict'      },
                { description: 'strict on',        option: 'no-strict',       state: false, expected: '--strict'         },
                { description: 'colors off',       option: 'no-colors',       state: true,  expected: '--no-colors'      },
                { description: 'colors on',        option: 'no-colors',       state: false, expected: '--colors'         },
            ]).
            it('correctly interprets negated boolean options', ({ option, state, expected }) => {
                const options = new CucumberOptions({
                    [option]: state,
                });

                expect(options.asArgumentsForCucumber(new Version('5.0.0'))).to.deep.equal([
                    'node', 'cucumber-js', expected,
                ]);
            });
        });

        describe('other options', () => {

            given([
                { description: 'profile',    option: 'profile',    value: ['dry', 'progress'],          expected: [ '--profile', 'dry', '--profile', 'progress' ] },
                { description: 'require',    option: 'require',    value: [ 'features/**/*.ts' ],       expected: [ '--require', 'features/**/*.ts' ] },
                { description: 'name',       option: 'name',       value: [ 'checkout.*', 'smoke.*' ],  expected: [ '--name', 'checkout.*',  '--name', 'smoke.*'  ] },
            ]).
            it('includes any other options', ({ option, value, expected }) => {
                const options = new CucumberOptions({
                    [option]: value,
                });

                expect(options.asArgumentsForCucumber(new Version('5.0.0'))).to.deep.equal(
                    ['node', 'cucumber-js'].concat(expected),
                );
            });
        });
    });
});
