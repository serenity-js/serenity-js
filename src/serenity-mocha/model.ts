import { Result, Scene } from '../serenity/domain';

function fullNameOf(scenario: ScenarioOrSuite) {
    return !! scenario.parent
        ? `${ fullNameOf(scenario.parent) } ${ scenario.title }`.trim()
        : scenario.title;
}

export function nameOf(scenario: ScenarioOrSuite) {
    return fullNameOf(scenario).substring(categoryOf(scenario).length).trim();
}

export function categoryOf(scenario: ScenarioOrSuite) {
    return !! scenario.parent && scenario.parent.title.trim() !== ''
        ? categoryOf(scenario.parent)
        : scenario.title;
}

export function finalStateOf(scenario: ExecutedScenario): Result {

    if (scenario.pending) {
        return Result.PENDING;
    }

    if (scenario.state === 'passed') {
        return Result.SUCCESS;
    }

    if (scenario.state === 'failed') {
        return Result.FAILURE;
    }

    if (scenario.timedOut) {
        return Result.COMPROMISED;
    }

    return Result.COMPROMISED;
}

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

export class MochaScene extends Scene {
    constructor(scenario: Scenario) {
        super(
            nameOf(scenario),
            categoryOf(scenario),
            scenario.file,
            [],
            scenario.fullTitle(),
        );
    }
}

export type ScenarioOrSuite = { title: string, parent: ScenarioOrSuite };
