import type { CapabilityScore,ReportOutcomes } from '../reporting/ReportData.js';

const WEIGHT_PASS_RATE = 0.40;
const WEIGHT_COMPLETENESS = 0.25;
const WEIGHT_CONSISTENCY = 0.35;

interface ScenarioInput {
    name: string;
    outcome: string;
    executionHistory?: string[];
}

interface CapabilityInput {
    outcomes: ReportOutcomes;
    scenarios: ScenarioInput[];
}

/**
 * Percentage of passing scenarios among executed (non-skipped, non-pending) ones.
 */
export function computePassRate(outcomes: ReportOutcomes): number {
    const executed = outcomes.passed + outcomes.failed + outcomes.compromised + outcomes.error;

    if (executed === 0) {
        return 0;
    }

    return Math.round((outcomes.passed / executed) * 100);
}

/**
 * Percentage of scenarios that are implemented (not pending or skipped).
 */
export function computeCompleteness(outcomes: ReportOutcomes): number {
    const total = outcomes.passed + outcomes.failed + outcomes.pending + outcomes.skipped + outcomes.compromised + outcomes.error;

    if (total === 0) {
        return 0;
    }

    const implemented = total - outcomes.pending - outcomes.skipped;

    return Math.round((implemented / total) * 100);
}

/**
 * Average consistency across scenarios, based on outcome flip rate in execution history.
 * Returns 100 (benefit of the doubt) when no history is available.
 */
export function computeConsistency(scenarios: ScenarioInput[]): number {
    if (scenarios.length === 0) {
        return 100;
    }

    let totalFlipRate = 0;
    let scoredCount = 0;

    for (const scenario of scenarios) {
        const history = scenario.executionHistory;

        if (!history || history.length < 2) {
            continue;
        }

        let flips = 0;
        for (let i = 1; i < history.length; i++) {
            if (history[i] !== history[i - 1]) {
                flips++;
            }
        }

        totalFlipRate += flips / (history.length - 1);
        scoredCount++;
    }

    if (scoredCount === 0) {
        return 100;
    }

    return Math.round((1 - totalFlipRate / scoredCount) * 100);
}

/**
 * Weighted composite of pass rate, completeness, and consistency.
 */
export function computeConfidence(scores: { passRate: number; completeness: number; consistency: number }): number {
    return Math.round(
        scores.passRate * WEIGHT_PASS_RATE +
        scores.completeness * WEIGHT_COMPLETENESS +
        scores.consistency * WEIGHT_CONSISTENCY,
    );
}

/**
 * Computes a full confidence score for a file-level capability node.
 * Confidence is a deterministic weighted composite of pass rate, completeness, and consistency.
 */
export function scoreCapability(node: CapabilityInput): CapabilityScore {
    const { outcomes, scenarios } = node;
    const total = outcomes.passed + outcomes.failed + outcomes.pending + outcomes.skipped + outcomes.compromised + outcomes.error;

    if (total === 0 || outcomes.skipped + outcomes.pending === total) {
        return { confidence: 0, passRate: 0, completeness: 0, consistency: 0 };
    }

    const passRate = computePassRate(outcomes);
    const completeness = computeCompleteness(outcomes);
    const consistency = computeConsistency(scenarios);
    const confidence = computeConfidence({ passRate, completeness, consistency });

    return { confidence, passRate, completeness, consistency };
}

/**
 * Aggregates child confidence scores weighted by scenario count.
 */
export function scoreDirectory(children: Array<{ confidence: number; scenarioCount: number }>): number {
    const totalScenarios = children.reduce((sum, child) => sum + child.scenarioCount, 0);

    if (totalScenarios === 0) {
        return 0;
    }

    const weightedSum = children.reduce((sum, child) => sum + child.confidence * child.scenarioCount, 0);

    return Math.round(weightedSum / totalScenarios);
}

/**
 * Computes the change in confidence from the previous run.
 * Returns undefined when no previous score is available.
 */
export function computeDelta(current: number, previous: number | undefined): number | undefined {
    if (previous === undefined) {
        return undefined;
    }

    return current - previous;
}

