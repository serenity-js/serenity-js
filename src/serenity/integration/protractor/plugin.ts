import {ProtractorPlugin} from 'protractor/built/plugins';

import serenity = require('../../index');
import {SerenityReporter, Scribe} from "../../reporting/scribe";
import {Serenity} from "../../serenity";
import {Md5} from "ts-md5/dist/md5";
import {FileSystemOutlet} from "../../reporting/outlet";

export interface TestInfo {
    name: string;
    category: string;
}

export default class SerenityProtractorPlugin extends ProtractorPlugin {

    // todo: register Serenity Json Reporter

    private reporter   = new SerenityReporter();
    private chronicler = Serenity.instance.chronicles();
    // todo: the path should be configurable and FileSystemOutlet retrieved from some DIC
    private scribe     = new Scribe(new FileSystemOutlet(`${process.cwd()}/target/site/serenity`));

    private id = 'serenity-protractor-plugin';


    setup() {

    };

    postTest(passed: boolean, info: TestInfo): Promise<void> {

        return this.reporter.reportOn(this.chronicler.readNewEntriesAs(this.id)).then( (reports) => {
            this.scribe.write(reports.pop(), `${this.hash(info.category, info.name)}.json`);
        });
    }

    postResults(): Promise<void> {

       // console.log(this.chronicler.readTheChronicle().map((entry) => entry.value));

        return Promise.resolve();
    }

    private hash(...values: string[]): string {
        return <string>Md5.hashAsciiStr(values.join(':'));
    }
};