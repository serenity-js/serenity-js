import { expect } from '@integration/testing-tools';
import { after,before, describe, it } from 'mocha';
import type { Page } from 'playwright';

import {setupReport, teardownReport } from './helpers/report-server';

describe('HTML Reporter', () => {

    let page: Page;
    let baseUrl: string;

    before(async () => {
        const fixture = await setupReport();
        page = fixture.page;
        baseUrl = fixture.baseUrl;
    });

    after(async () => {
        await teardownReport();
    });

    describe('Dashboard', () => {

        before(async () => {
            await page.goto(`${baseUrl}/index.html#/`);
            await page.waitForSelector('.donut-chart, .card-value');
        });

        it('displays the pass rate', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('66.7%');
        });

        it('displays degraded tests in the Degraded card', async () => {
            const cards = await page.$$('.card');
            let degradedCardText = '';
            for (const card of cards) {
                const text = await card.textContent();
                if (text?.includes('Degraded')) { degradedCardText = text; break; }
            }
            expect(degradedCardText).to.contain('should complete an item');
            expect(degradedCardText).to.not.contain('No degraded tests');
        });

        it('displays recovered tests in the Recovered card', async () => {
            const cards = await page.$$('.card');
            let recoveredCardText = '';
            for (const card of cards) {
                const text = await card.textContent();
                if (text?.includes('Recovered')) { recoveredCardText = text; break; }
            }
            expect(recoveredCardText).to.contain('should persist items');
            expect(recoveredCardText).to.not.contain('No newly recovered tests');
        });

        it('displays the total scenario count', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('6 scenarios');
        });
    });

    describe('Test Scenarios', () => {

        describe('listing', () => {

            before(async () => {
                await page.goto(`${baseUrl}/index.html#/tests`);
                await page.waitForSelector('.scenario-item');
            });

            it('displays all scenarios', async () => {
                const text = await page.textContent('body');
                expect(text).to.contain('Showing 6 of 6 test scenarios');
            });

            it('shows scenario names', async () => {
                const text = await page.textContent('body');
                expect(text).to.contain('should display items');
                expect(text).to.contain('should add a new item');
            });

            it('shows source paths', async () => {
                const text = await page.textContent('body');
                expect(text).to.contain('todo/display.spec.ts');
            });
        });

        describe('search by source path', () => {

            before(async () => {
                await page.goto(`${baseUrl}/index.html#/tests?search=%22complete.spec%22`);
                await page.waitForFunction(() => document.body.textContent?.includes('Showing 1 of 6'));
            });

            it('filters scenarios matching source file name', async () => {
                const text = await page.textContent('body');
                expect(text).to.contain('Showing 1 of 6 test scenarios');
                expect(text).to.contain('should complete an item');
            });
        });

        describe('search by category', () => {

            it('filters scenarios by category name', async () => {
                await page.evaluate(() => window.location.hash = '#/tests?search=%22Persistence%22');
                await page.waitForFunction(() => document.body.textContent?.includes('Showing 2 of 6'));
                const text = await page.textContent('body');
                expect(text).to.contain('Showing 2 of 6 test scenarios');
            });
        });
    });

    describe('Requirements', () => {

        before(async () => {
            await page.goto(`${baseUrl}/index.html#/requirements`);
            await page.waitForSelector('.card');
        });

        it('displays coverage percentage', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('100%');
        });

        it('displays the requirements tree', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('todo');
            expect(text).to.contain('persistence');
        });

        it('renders the readme as HTML', async () => {
            const readmeElement = await page.$('[style*="border-left"] strong');
            expect(readmeElement).to.not.be.null;
            const strongText = await readmeElement!.textContent();
            expect(strongText).to.equal('Todo application');
        });

        it('displays scenario counts per requirement', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('6 scenarios total');
        });
    });

    describe('System Context', () => {

        before(async () => {
            await page.goto(`${baseUrl}/index.html#/system`);
            await page.waitForSelector('.context-grid');
        });

        it('displays Node.js version', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('v22.0.0');
        });

        it('displays OS information', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('macOS');
            expect(text).to.contain('14.5');
            expect(text).to.contain('arm64');
        });

        it('displays the test runner', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('Playwright');
            expect(text).to.contain('1.60.0');
        });

        it('displays Serenity/JS version', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('3.44.0');
        });

        it('displays CI provider information', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('GitHub Actions');
            expect(text).to.contain('#42');
            expect(text).to.contain('main');
            expect(text).to.contain('abc1234');
        });

        it('displays the commit message', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('fix: resolve flaky test');
        });
    });

    describe('Errors', () => {

        before(async () => {
            await page.goto(`${baseUrl}/index.html#/errors`);
            await page.waitForFunction(() => document.body.textContent?.includes('Expected item'));
        });

        it('displays error scenarios', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('should complete an item');
        });

        it('shows error messages', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('Expected item to be checked');
        });
    });

    describe('Pending scenario detail', () => {

        before(async () => {
            await page.goto(`${baseUrl}/index.html#/tests/${encodeURIComponent('/project/spec/persistence.spec.ts:20')}`);
            await page.waitForFunction(() => document.body.textContent?.includes('ImplementationPendingError'));
        });

        it('displays the error name', async () => {
            const errorName = await page.textContent('.error-name');
            expect(errorName).to.contain('ImplementationPendingError');
        });

        it('displays the failing step location next to the error name', async () => {
            const errorName = await page.textContent('.error-name');
            expect(errorName).to.contain('persistence.spec.ts:22');
        });

        it('displays a copy location button in the error block', async () => {
            const copyButton = await page.$('.error-name [title="Copy location"]');
            expect(copyButton).to.not.be.null;
        });

        it('displays activity locations in the activity tree', async () => {
            const text = await page.textContent('.activity-tree');
            expect(text).to.contain('Given a step that passes');
            expect(text).to.contain('And a step that is pending');
        });

        it('displays copy invocation location buttons for activities', async () => {
            const btns = await page.$$('[title*="Copy invocation location"]');
            expect(btns.length).to.be.greaterThan(0);
        });
    });

    describe('Scenario outline detail', () => {

        before(async () => {
            await page.goto(`${baseUrl}/index.html#/tests/${encodeURIComponent('/project/features/greetings.feature:3')}`);
            await page.waitForFunction(() => document.body.textContent?.includes('should greet'));
        });

        it('displays the scenario outline template', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('Given <Developer> is a contributor');
        });

        it('groups examples by parameter set name', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('contributors');
        });

        it('displays parameter values for each example', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('jan-molak');
            expect(text).to.contain('alice');
        });

        it('displays activities for each example row', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('Given jan-molak is a contributor');
            expect(text).to.contain('Given alice is a contributor');
        });
    });

    describe('Stability', () => {

        before(async () => {
            await page.goto(`${baseUrl}/index.html#/stability`);
            await page.waitForFunction(() => document.body.textContent?.includes('should complete an item'));
        });

        it('displays unstable tests', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('should complete an item');
        });

        it('shows the flakiness rate', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('50%');
        });
    });

    describe('Tags', () => {

        before(async () => {
            await page.goto(`${baseUrl}/index.html#/tags`);
            await page.waitForSelector('.tag-card');
        });

        it('displays feature tags', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('Todo List');
            expect(text).to.contain('Persistence');
        });

        it('displays browser tags', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('chromium 120.0');
        });
    });
});
