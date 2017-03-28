export interface Tag {
    name: string;
}

export interface Feature {
    name: string;
}

export interface Scenario {
    feature: Feature;
    line: number;
    name: string;
    tags: Tag[];
    uri: string;
}

export interface Step {
    keyword: string;
    name: string;
    isHidden: boolean;
    arguments: StepArgument[];
}

export type StepArgument = DataTable | DocString;

export interface DataTable {
    hashes(): any;
    raw(): any;
    rows(): any[];
    rowsHash(): any;
}

export interface DocString {
    content: string;
    contentType: string;
    line: number;
}

export type Status = 'ambiguous' | 'failed' | 'passed' | 'pending' | 'skipped' | 'undefined';

export interface StepResult {
    status: Status;
    step: Step;
    failureException?: FailureException;
}

export interface ScenarioResult {
    status: Status;
    scenario: Scenario;
    failureException?: FailureException;
}

export type FailureException = Error | string;
