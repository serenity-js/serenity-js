import { FileSystemOutlet } from '../../serenity/reporting/outlet';
import { RehearsalReport, Scribe } from '../../serenity/reporting/scribe';
import { Serenity } from '../../serenity/serenity';
import { ProtractorPlugin } from 'protractor/built/plugins';
import { Md5 } from 'ts-md5/dist/md5';

export interface TestInfo {
    name: string;
    category: string;
}

export class SerenityProtractorPlugin extends ProtractorPlugin {

    private reporter        = new RehearsalReport();                    // todo: register Serenity Json Reporter

    private scribe;
    private id = 'serenity-protractor-plugin';

    setup() {
        // todo: the path should be configurable and FileSystemOutlet retrieved from some DIC
        this.scribe = new Scribe(new FileSystemOutlet(`${process.cwd()}/target/site/serenity`));
    };

    postTest(passed: boolean, info: TestInfo): Promise<void> {

        return this.reporter.of(Serenity.instance.stageManager().readNewJournalEntriesAs(this.id)).then( (reports) => {
            this.scribe.write(reports.pop(), `${this.hash(info.category, info.name)}.json`);
        });
    }

    postResults(): Promise<void> {
        return Promise.resolve();
    }

    private hash(...values: string[]): string {
        return <string> Md5.hashAsciiStr(values.join(':'));
    }
}
