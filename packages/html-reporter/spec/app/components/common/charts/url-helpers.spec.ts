import { expect, test } from '@playwright/test';

import { buildModuleOutcomeUrl, buildModuleUrl } from '../../../../../app/utils/moduleUrls';

test.describe('TrendChartDetails URL helpers', () => {

    test.describe('buildModuleUrl', () => {

        test('encodes module name and run ID', () => {
            const url = buildModuleUrl('8333', 'playwright-test');
            expect(url).toBe('/tests?run=8333&search=%40module%3Aplaywright-test');
        });

        test('handles special characters in module ID', () => {
            const url = buildModuleUrl('8333', 'cucumber-8-javascript-api');
            expect(url).toContain('cucumber-8-javascript-api');
        });

        test('encodes spaces in run ID', () => {
            const url = buildModuleUrl('run 123', 'module-a');
            expect(url).toContain('run%20123');
        });
    });

    test.describe('buildModuleOutcomeUrl', () => {

        test('includes filter parameter for failed outcome', () => {
            const url = buildModuleOutcomeUrl('8333', 'playwright-test', 'failed');
            expect(url).toBe('/tests?run=8333&search=%40module%3Aplaywright-test&filter=failed');
        });

        test('supports passed filter', () => {
            const url = buildModuleOutcomeUrl('8333', 'module', 'passed');
            expect(url).toContain('filter=passed');
        });

        test('supports failed filter', () => {
            const url = buildModuleOutcomeUrl('8333', 'module', 'failed');
            expect(url).toContain('filter=failed');
        });

        test('supports skipped filter', () => {
            const url = buildModuleOutcomeUrl('8333', 'module', 'skipped');
            expect(url).toContain('filter=skipped');
        });

        test('combines run ID, module search, and filter', () => {
            const url = buildModuleOutcomeUrl('8333', 'my-module', 'failed');
            expect(url).toContain('run=8333');
            expect(url).toContain('search=%40module%3Amy-module');
            expect(url).toContain('filter=failed');
        });
    });
});
