declare global {
    interface Window {
        __SERENITY_REPORT_DATA__: any;
    }
}

export const DATA: any = window.__SERENITY_REPORT_DATA__;
