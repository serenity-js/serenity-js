// export class

export interface Identifiable {
    id(): string;
}

export class Test implements Identifiable {
    private _name;
    private _testCaseName;
    private _title;

    constructor(name: string, testCaseName: string, title: string = name) {
        this._name          = name;
        this._testCaseName  = testCaseName;
        this._title         = title;
    }

    public get title(): string {
        return this._title;
    }

    public get name(): string {
        return this._name;
    }

    public get testCaseName(): string {
        return this._testCaseName;

    }

    public id() {
        return `${this.testCaseName}_${this.name}`;
    }
}

export class TestSummary {
    public get title(): string {
        return "Displaying potential failure cause";
    }

    public get name(): string {
        return "displaying_potential_failure_cause";
    }

    public get testCaseName(): string {
        return "features.ShouldTellWhatBrokeTheBuild";

    }

    public get startTime(): number {
        return 1466457468037;
    }


    public get duration(): number {
        return 79546;
    }

    public get sessionId(): string {
        return "62f827eb-0194-d844-9646-c1b616bca7a8";
    }

    public get driver(): string {
        return "firefox";
    }

    public get manual(): boolean {
        return false;
    }


    public get result(): string {
        return "SUCCESS";
    }
}

export class Step {

}