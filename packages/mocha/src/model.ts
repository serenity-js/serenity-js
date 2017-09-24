import { Outcome, RecordedScene, Result, SceneFinished, SceneStarts } from '@serenity-js/core/lib/domain';

export const startOf   = (scenario: Scenario) => new SceneStarts(new MochaScene(scenario));
export const endOf     = (scenario: ExecutedScenario) => new SceneFinished(new Outcome(new MochaScene(scenario), finalStateOf(scenario), scenario.err));
export const isPending = (scenario: ExecutedScenario) => finalStateOf(scenario) === Result.PENDING;

export interface TestError {
    name: string;
    message: string;
    showDiff: boolean;
    actual: string;
    expected: string;
    stack: string;
}

export interface Scenario {
    title: string;
    async: number;
    sync: boolean;
    timedOut: boolean;
    pending: boolean;
    type: string;
    file: string;
    parent: any;
    ctx: any;

    body(): string;
    fullTitle(): string;
}

export interface ExecutedScenario extends Scenario {
    time: any;
    duration: number;
    state: string;
    speed: string;
    err?: TestError;
}

class MochaScene extends RecordedScene {
    constructor(scenario: Scenario) {
        super(
            nameOf(scenario),
            categoryOf(scenario),
            { path: scenario.file },
            [],
            scenario.fullTitle(),
        );
    }
}

function finalStateOf(scenario: ExecutedScenario): Result {

    if (scenario.pending) {
        return Result.PENDING;
    }

    if (scenario.state === 'passed') {
        return Result.SUCCESS;
    }

    if (timedOut(scenario) || hasErrors(scenario)) {
        return Result.ERROR;
    }

    if (scenario.state === 'failed') {
        return Result.FAILURE;
    }

    return Result.COMPROMISED;
}

function timedOut(scenario: ExecutedScenario) {
    // Mocha sets the `timedOut` flag *after* notifying the reporter of a test failure, hence the regex check.
    return scenario.timedOut || (scenario.err && /^Timeout.*exceeded/.test(scenario.err.message));
}

function hasErrors(scenario: ExecutedScenario) {
    return scenario.err && scenario.err.constructor && ! /AssertionError/.test(scenario.err.constructor.name);
}

interface ScenarioOrSuite {
    title: string;
    parent: ScenarioOrSuite;
}

function fullNameOf(scenario: ScenarioOrSuite) {
    return !! scenario.parent
        ? `${ fullNameOf(scenario.parent) } ${ scenario.title }`.trim()
        : scenario.title;
}

function nameOf(scenario: ScenarioOrSuite) {
    return fullNameOf(scenario).substring(categoryOf(scenario).length).trim();
}

function categoryOf(scenario: ScenarioOrSuite) {
    return !! scenario.parent && scenario.parent.title.trim() !== ''
        ? categoryOf(scenario.parent)
        : scenario.title;
}
