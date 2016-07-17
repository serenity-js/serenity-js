export enum Result {
    /**
     * Failures due to external events or systems that compromise the validity of the test.
     */
    COMPROMISED,
    /**
     * Failure, due to some other exception.
     */
    ERROR,

    /**
     * Failure, due to an assertion error
     * For a test case, this means one of the tests in the test case failed.
     */
    FAILURE,

    /**
     * The test step was not executed because a previous step in this test case failed.
     * A whole test case can be skipped using tags or annotations to indicate that it is currently "work-in-progress"
     */
    SKIPPED,

    /**
     * The test or test case was deliberately ignored.
     * Tests can be ignored via the @Ignore annotation in JUnit, for example.
     * Ignored tests are not considered the same as pending tests: a pending test is one that
     * has been specified, but the corresponding code is yet to be implemented, whereas an
     * ignored test can be a temporarily-deactivated test (during refactoring, for example).
     */
    IGNORED,

    /**
     * A pending test is one that has been specified but not yet implemented.
     * In a JUnit test case, you can use the (Thucydides) @Pending annotation to mark this.
     * A pending test case is a test case that has at least one pending test.
     */
    PENDING,

    /**
     * The test or test case ran as expected.
     */
    SUCCESS
}

export interface Identifiable {
    id: string;
}

export class Scene implements Identifiable {
    constructor(public name: string, public category: string, public path: string, public id: string = `${category}:${name}`) { }
}

// todo: should include the Actor
export class Activity implements Identifiable {
    constructor(public name: string, public id: string = name, public promisedScreenshots: PromiseLike<Screenshot>[] = []) { }

    withScreenshot(screenshot: PromiseLike<Screenshot>) {
        return new Activity(this.name, this.id, this.promisedScreenshots.concat(screenshot));
    }
}

export class Outcome<T> {
    constructor(public subject: T, public result: Result, public error?: Error) {}
}

// todo: remove
export class Screenshot {
    constructor(public path: string) {}
}

export class Picture {
    constructor(public path: string) {}
}

export class PictureReceipt {
    constructor(public activity: Activity, public picture: Promise<Picture>) {}
}
