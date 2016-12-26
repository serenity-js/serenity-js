export enum Result {
    /**
     * Failures due to external events or systems that compromise the validity of the test.
     */
    COMPROMISED = 1 << 0,
    /**
     * Failure, due to some other exception.
     */
    ERROR       = 1 << 1,

    /**
     * Failure, due to an assertion error
     * For a test case, this means one of the tests in the test case failed.
     */
    FAILURE     = 1 << 2,

    /**
     * The test step was not executed because a previous step in this test case failed.
     * A whole test case can be skipped using tags or annotations to indicate that it is currently "work-in-progress"
     */
    SKIPPED     = 1 << 3,

    /**
     * The test or test case was deliberately ignored.
     * Tests can be ignored via the @Ignore annotation in JUnit, for example.
     * Ignored tests are not considered the same as pending tests: a pending test is one that
     * has been specified, but the corresponding code is yet to be implemented, whereas an
     * ignored test can be a temporarily-deactivated test (during refactoring, for example).
     */
    IGNORED     = 1 << 4,

    /**
     * A pending test is one that has been specified but not yet implemented.
     * In a JUnit test case, you can use the (Thucydides) @Pending annotation to mark this.
     * A pending test case is a test case that has at least one pending test.
     */
    PENDING     = 1 << 5,

    /**
     * The test or test case ran as expected.
     */
    SUCCESS     = 1 << 6,

    Failed      = COMPROMISED | ERROR | FAILURE,
    Finished    = Failed | SUCCESS,
}

export interface Identifiable {
    id: string;
}

export class Tag {
    private static Pattern = /^@([\w-]+)[:\s]?(.*)/i;

    public static from(text: string): Tag {
        let [, type, values] = Tag.Pattern.exec(text);

        return new Tag(
            type,
            values.split(',').filter(_ => _.length > 0).map(_ => _.trim()),
        );
    }

    constructor(public type: string, public values: string[] = []) {
    }

    public get value() {
        return this.values.join(', ');
    }
}

export class Scene implements Identifiable {
    constructor(public name: string, public category: string, public path: string, public tags: Tag[] = [], public id: string = `${category}:${name}`) { }

    toString() {
        return `${this.name} (category: ${this.category}, path: ${this.path}${when(this.id !== this.name, ', id: ' + this.id)})`;
    }
}

export class Activity implements Identifiable {
    constructor(public name: string, public id: string = name) { }

    equals(another: Activity): boolean {
        return this.name === another.name && this.id === another.id;
    }

    toString() {
        return `${this.name}${when(this.id !== this.name, ' (id: ' + this.id + ')')}`;
    }
}

export class Outcome<T> {
    constructor(public subject: T, public result: Result, public error?: Error) {}

    toString() {
        return `${this.subject.toString()} (result: ${Result[this.result]}${when(!! this.error, ', error:' + this.error)})`;
    }
}

export class Photo {
    constructor(public path: string) {}
}

export class PhotoReceipt {
    constructor(public activity: Activity, public photo: PromiseLike<Photo>) {}

    toString() {
        return this.activity.toString();
    }
}

function when(condition: boolean, value: string): string {
    return condition ? value : '';
}
