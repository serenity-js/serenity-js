import type { ReportData } from '../../src/ReportData';

declare global {
    interface Window {
        __SERENITY_REPORT_DATA__: ReportData;
    }
}

export const DATA: ReportData = window.__SERENITY_REPORT_DATA__;
