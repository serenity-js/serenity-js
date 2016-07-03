import {ProtractorPlugin} from 'protractor/built/plugins';

import serenity = require('../../index');
import {SerenityReporter, Scribe} from "../../reporting/scribe";
import {Serenity} from "../../serenity";
import {Md5} from "ts-md5/dist/md5";

interface TestInfo {
    name: string;
    category: string;
}

export default class SerenityProtractorPlugin extends ProtractorPlugin {

    // todo: some DI would be useful here ..
    // todo: register Serenity Json Reporter

    private reporter   = new SerenityReporter();
    private chronicler = Serenity.instance.chronicles();
    private scribe     = new Scribe(`${process.cwd()}/target/site/serenity`);   // todo: should be configurable

    private id = 'serenity-protractor-plugin';


    setup() {
        // console.log("options:", this.config['integration']);

        // console.log('initialised: ', Serenity.instance.name());
        console.log('initialised: ', serenity.name());
    };

    postTest(passed: boolean, info: TestInfo): Promise<void> {

        let report = this.reporter.reportOn(this.chronicler.readNewEntriesAs(this.id)).pop();

        return this.scribe.write(report, `${this.hash(info.category, info.name)}.json`);
    }

    postResults(): Promise<void> {

        return Promise.resolve();
    }

    private hash(...values: string[]): string {
        return <string>Md5.hashAsciiStr(values.join(':'));
    }
};