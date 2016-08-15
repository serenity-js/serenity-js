import { SceneFinished, SceneStarts } from '../serenity/domain/events';
import { Outcome, Result, Scene } from '../serenity/domain/model';
import { Serenity } from '../serenity/serenity';

export class Notifier {

    /*
     Notifier:: Running suite with 1
     Started
     Notifier:: Suite started: Record Todos whose full description is: Record Todos
     Notifier:: Suite started: When adding new items whose full description is: Record Todos When adding new items
     Notifier:: Spec started: adds an item to an empty list whose full description is: Record Todos When adding new items adds an item to an empty list
     Notifier:: Spec: adds an item to an empty list was passed
     0
     .
     Notifier:: Suite: When adding new items was finished
     Notifier:: Suite: Record Todos was finished
     Notifier:: Finished suite
     */

    jasmineStarted(suiteInfo: { totalSpecsDefined: number }) {
        // console.log('Notifier:: Running suite with ' + suiteInfo.totalSpecsDefined);
    }

    suiteStarted(suite: JasmineSpec) {

        // console.log('Notifier:: Suite started: ' + suite.description + ' whose full description is: ' + suite.fullName);
    }

    specStarted(spec: JasmineSpec) {

        Serenity.notify(new SceneStarts(new JasmineScene(spec)));

        // console.log('Notifier:: Spec started: ' + spec.description + ' whose full description is: ' + spec.fullName);
    }

    specDone(result: JasmineResult) {

        Serenity.notify(new SceneFinished(new JasmineOutcome(result)));

        // console.log('Notifier:: Spec: ' + result.description + ' was ' + result.status);
        // for (let i = 0; i < result.failedExpectations.length; i++) {
        //     console.log('Notifier:: Failure: ' + result.failedExpectations[ i ].message);
        //     console.log(result.failedExpectations[ i ].stack);
        // }
        // console.log(result.passedExpectations.length);
    }

    suiteDone(result: { description: string, fullName: string, status: string, failedExpectations: Error[] }) {

        // console.log('Notifier:: Suite: ' + result.description + ' was ' + result.status);
        // for (let i = 0; i < result.failedExpectations.length; i++) {
        //     console.log('Notifier:: AfterAll ' + result.failedExpectations[ i ].message);
        //     console.log(result.failedExpectations[ i ].stack);
        // }
    }

    jasmineDone() {
        // console.log('Notifier:: Finished suite');
    }
}

export interface JasmineResult extends JasmineSpec {
    status: string;
    failedExpectations: Error[];
}

export interface JasmineSpec {
    description: string;
    fullName: string;
}

class JasmineOutcome extends Outcome<JasmineScene> {
    static translated(status: string): Result {
        switch (status) {
            case 'failed':
                return Result.FAILURE;
            case 'pending':
                return Result.PENDING;
            case 'passed':
                return Result.SUCCESS;
            case 'skipped':
                return Result.SKIPPED;
            default:
                throw new Error(`Couldn't map the '${ status }' to a Serenity Result`);
        }
    }

    constructor(result: JasmineResult) {
        super(new JasmineScene(result), JasmineOutcome.translated(result.status), result.failedExpectations.pop());
    }
}

class JasmineScene extends Scene {
    constructor(spec: JasmineSpec) {
        super(
            spec.description,
            spec.fullName,
            `${spec.fullName}:${spec.description}`,
            `${spec.fullName}:${spec.description}`
        );
    }
}
