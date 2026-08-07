/**
 * Re-exports the link utilities from the src implementation.
 * 
 * The app/ code is bundled by esbuild which resolves .js imports to .ts source files.
 * This re-export provides a stable import path for components within app/.
 * 
 * @module
 */
export type {
    AboutLink,
    CapabilitiesLink,
    ConsistencyLink,
    DashboardLink,
    ErrorsLink,
    LinkOptions,
    OutcomeFilter,
    SystemLink,
    TagsLink,
    TestRunsLink,
    TestsLink,
    TimelineLink,
} from '../../src/navigation/link.js';
export {
    capabilityLink,
    link,
    scenarioLink,
    testsLink,
} from '../../src/navigation/link.js';
