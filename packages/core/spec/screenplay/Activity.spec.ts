import { before, describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import { tsImport } from 'tsx/esm/api';

import { fileUrlToPath, nonSerenityNodeModulePattern } from '../../src/screenplay/Activity.js';
import type { Answerable, UsesAbilities } from '../../src/screenplay/index.js';
import { Activity, Interaction, Task } from '../../src/screenplay/index.js';
import { expect } from '../expect.js';

describe('Activity', () => {

    describe('when checking activity types', () => {

        // Simulates the dual-package hazard, where @serenity-js/core is loaded twice:
        // once from the CJS build and once from the ESM build.
        // tsImport loads the entire module graph under a separate namespace, giving us a distinct copy of each class.
        // See https://github.com/serenity-js/serenity-js/issues/3535
        let anotherCopyOfCore: {
            Activity: typeof Activity,
            Interaction: typeof Interaction,
            Task: typeof Task,
        };

        before(async () => {
            anotherCopyOfCore = await tsImport('../../src/screenplay/index.js', import.meta.url);

            expect(anotherCopyOfCore.Interaction, 'precondition: a distinct copy of the Interaction class').to.not.equal(Interaction);
        });

        describe('created by the same copy of @serenity-js/core', () => {

            it('recognises an interaction', () => {
                const interaction = Interaction.where('#actor does something', () => void 0);

                expect(interaction).to.be.instanceOf(Activity);
                expect(interaction).to.be.instanceOf(Interaction);
                expect(interaction).to.not.be.instanceOf(Task);
            });

            it('recognises a task', () => {
                const task = Task.where('#actor does something');

                expect(task).to.be.instanceOf(Activity);
                expect(task).to.be.instanceOf(Task);
                expect(task).to.not.be.instanceOf(Interaction);
            });
        });

        describe('created by another copy of @serenity-js/core', () => {

            it('recognises an interaction', () => {
                const interaction = anotherCopyOfCore.Interaction.where('#actor does something', () => void 0);

                expect(interaction).to.be.instanceOf(Activity);
                expect(interaction).to.be.instanceOf(Interaction);
                expect(interaction).to.not.be.instanceOf(Task);
            });

            it('recognises a task', () => {
                const task = anotherCopyOfCore.Task.where('#actor does something');

                expect(task).to.be.instanceOf(Activity);
                expect(task).to.be.instanceOf(Task);
                expect(task).to.not.be.instanceOf(Interaction);
            });

            it('recognises a custom interaction class extending Interaction', () => {
                // Mirrors interactions like Navigate or Click defined in another module, such as @serenity-js/web
                class Navigate extends anotherCopyOfCore.Interaction {
                    constructor(private readonly url: Answerable<string>) {
                        super(`#actor navigates to ${ url }`);
                    }

                    async performAs(actor: UsesAbilities): Promise<void> {
                        // no-op
                    }
                }

                const interaction = new Navigate('https://serenity-js.org');

                expect(interaction).to.be.instanceOf(Activity);
                expect(interaction).to.be.instanceOf(Interaction);
                expect(interaction).to.not.be.instanceOf(Task);
            });
        });

        describe('of custom activity classes', () => {

            it('distinguishes between distinct classes with the same name', () => {
                const createInteractionClass = () =>
                    class Navigate extends Interaction {
                        async performAs(actor: UsesAbilities): Promise<void> {
                            // no-op
                        }
                    };

                const Navigate = createInteractionClass();
                const AnotherNavigate = createInteractionClass();

                expect(new Navigate('#actor navigates')).to.be.instanceOf(Navigate);
                expect(new Navigate('#actor navigates')).to.not.be.instanceOf(AnotherNavigate);
            });
        });

        given([
            { description: 'undefined',                 value: undefined                    },
            { description: 'null',                      value: null                         },
            { description: 'string',                    value: 'Interaction'                },
            { description: 'number',                    value: 42                           },
            { description: 'plain object',              value: { performAs: () => void 0 }  },
            { description: 'function',                  value: () => void 0                 },
        ]).
        it('does not recognise non-activities as activities:', ({ value }) => {
            expect(value).to.not.be.instanceOf(Activity);
            expect(value).to.not.be.instanceOf(Interaction);
            expect(value).to.not.be.instanceOf(Task);
        });
    });

    describe('nonSerenityNodeModulePattern', () => {

        given([
            { description: 'forward slash (Unix / ESM URLs)',   fileName: '/project/node_modules/mocha/lib/runnable.js' },
            { description: 'backslash (Windows CJS)',           fileName: 'D:\\project\\node_modules\\mocha\\lib\\runnable.js' },
            { description: 'file:/// URL (Windows ESM)',        fileName: 'file:///D:/project/node_modules/mocha/lib/runnable.js' },
            { description: 'file:/// URL (Unix ESM)',           fileName: 'file:///project/node_modules/mocha/lib/runnable.js' },
            { description: 'pnpm virtual store path',           fileName: '/project/node_modules/.pnpm/mocha@12.0.0/node_modules/mocha/lib/runnable.js' },
        ]).
        it('matches non-Serenity/JS node_modules paths with', ({ fileName }) => {
            expect(nonSerenityNodeModulePattern.test(fileName)).to.equal(true);
        });

        given([
            { description: 'forward slash',                     fileName: '/project/node_modules/@serenity-js/core/lib/screenplay/Activity.js' },
            { description: 'backslash (Windows)',               fileName: 'D:\\project\\node_modules\\@serenity-js\\core\\lib\\screenplay\\Activity.js' },
            { description: 'file:/// URL (Windows ESM)',        fileName: 'file:///D:/project/node_modules/@serenity-js/core/lib/screenplay/Activity.js' },
        ]).
        it('does not match @serenity-js/ paths with', ({ fileName }) => {
            expect(nonSerenityNodeModulePattern.test(fileName)).to.equal(false);
        });

        given([
            { description: 'Unix absolute path',               fileName: '/home/user/project/spec/test.spec.ts' },
            { description: 'Windows absolute path',             fileName: 'D:\\Users\\project\\spec\\test.spec.ts' },
            { description: 'file:/// URL',                      fileName: 'file:///home/user/project/spec/test.spec.ts' },
        ]).
        it('does not match user-land paths with', ({ fileName }) => {
            expect(nonSerenityNodeModulePattern.test(fileName)).to.equal(false);
        });
    });

    describe('fileUrlToPath', () => {

        given([
            { description: 'Windows file:/// URL',              fileName: 'file:///D:/project/src/test.ts',         expected: 'D:/project/src/test.ts' },
            { description: 'Windows file:/// with lowercase',   fileName: 'file:///c:/project/src/test.ts',         expected: 'c:/project/src/test.ts' },
            { description: 'Unix file:/// URL',                 fileName: 'file:///home/user/project/test.ts',      expected: '/home/user/project/test.ts' },
        ]).
        it('strips file:/// prefix correctly for', ({ fileName, expected }) => {
            expect(fileUrlToPath(fileName)).to.equal(expected);
        });

        given([
            { description: 'Unix absolute path',               fileName: '/home/user/project/test.ts' },
            { description: 'Windows backslash path',            fileName: 'D:\\project\\src\\test.ts' },
            { description: 'relative path',                     fileName: 'src/test.ts' },
        ]).
        it('returns non-URL paths unchanged for', ({ fileName }) => {
            expect(fileUrlToPath(fileName)).to.equal(fileName);
        });
    });
});
