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
            expect(text).to.contain('60.0%');
        });

        it('displays degraded tests', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('should complete an item');
        });

        it('displays the total scenario count', async () => {
            const text = await page.textContent('body');
            expect(text).to.contain('5 scenarios');
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
                expect(text).to.contain('Showing 5 of 5 test scenarios');
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
                await page.waitForFunction(() => document.body.textContent?.includes('Showing 1 of 5'));
            });

            it('filters scenarios matching source file name', async () => {
                const text = await page.textContent('body');
                expect(text).to.contain('Showing 1 of 5 test scenarios');
                expect(text).to.contain('should complete an item');
            });
        });

        describe('search by category', () => {

            it('filters scenarios by category name', async () => {
                await page.evaluate(() => window.location.hash = '#/tests?search=%22Persistence%22');
                await page.waitForFunction(() => document.body.textContent?.includes('Showing 2 of 5'));
                const text = await page.textContent('body');
                expect(text).to.contain('Showing 2 of 5 test scenarios');
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
            expect(text).to.contain('5 scenarios total');
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
