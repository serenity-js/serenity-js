import type { ReportData } from '../../src/cli/ReportData.js';

let validated = false;

function getReportData(): ReportData {
    const raw = (window as { __SERENITY_REPORT_DATA__?: ReportData }).__SERENITY_REPORT_DATA__;

    if (!raw) {
        throw new Error('Report data not found. Ensure data.js is loaded before the application script.');
    }

    if (!validated) {
        const requiredFields: Array<keyof ReportData> = ['summary', 'scenarios'];
        const missing = requiredFields.filter(field => raw[field] == null);
        if (missing.length > 0) {
            throw new Error(`Report data is incomplete. Required field(s) missing: ${missing.join(', ')}`);
        }
        validated = true;
    }

    return raw;
}

// Lazy proxy — validation runs on first property access, not at import time
export const DATA: ReportData = new Proxy({} as ReportData, {
    get(_target, prop: string) {
        return getReportData()[prop as keyof ReportData];
    },
});
