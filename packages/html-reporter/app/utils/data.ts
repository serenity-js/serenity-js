import type { ReportData } from '../../src/cli/ReportData.js';

const raw = (window as { __SERENITY_REPORT_DATA__?: ReportData }).__SERENITY_REPORT_DATA__;

if (!raw) {
    throw new Error('Report data not found. Ensure data.js is loaded before the application script.');
}

export const DATA: ReportData = raw;
