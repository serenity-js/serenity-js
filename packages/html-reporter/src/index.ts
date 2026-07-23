import type { StageCrewMemberBuilder } from '@serenity-js/core';

import { HtmlReporter } from './cli/HtmlReporter.js';
import type { HtmlReporterConfig } from './cli/HtmlReporterConfig.js';

export { HtmlReporter } from './cli/HtmlReporter.js';
export type { HtmlReporterConfig } from './cli/HtmlReporterConfig.js';
export { HtmlReportGenerator } from './cli/HtmlReportGenerator.js';
export type { ActivityRecord, OutcomeCounts, RestQueryRecord, RunData, SceneRecord, TagRecord } from './cli/model/RunData.js';
export type {
    ReportActivity,
    ReportAttempt,
    ReportCapabilityNode,
    ReportCIContext,
    ReportData,
    ReportDataEntry,
    ReportExecutionHistoryEntry,
    ReportHistoryEntry,
    ReportOutcomes,
    ReportRestQuery,
    ReportScenario,
    ReportSummary,
    ReportSystemContext,
    ReportTag,
} from './cli/ReportData.js';
export type { SystemContext } from './cli/SystemContextDetector.js';
export { TestRunArchiver } from './cli/TestRunArchiver.js';

export default function create(config: HtmlReporterConfig = {}): StageCrewMemberBuilder<HtmlReporter> {
    return HtmlReporter.fromJSON(config);
}
