import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { fileUrlToPath, nonSerenityNodeModulePattern } from '../../src/screenplay/Activity.js';
import { expect } from '../expect.js';

describe('Activity', () => {

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
