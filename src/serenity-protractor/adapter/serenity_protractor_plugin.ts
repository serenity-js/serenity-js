import { Deferred } from '../../serenity/recording/async';
import { FileSystemOutlet } from '../../serenity/reporting/outlet';
import { EventLog, RehearsalReport, Scribe } from '../../serenity/reporting/scribe';
import { Serenity } from '../../serenity/serenity';
import { ProtractorPlugin } from 'protractor/built/plugins';
import { Md5 } from 'ts-md5/dist/md5';

export interface TestInfo {
    name: string;
    category: string;
}

export class SerenityProtractorPlugin extends ProtractorPlugin {

    private reporter    = new RehearsalReport();
    private debug       = new EventLog();

    private printEvents = true;

    private scribe;
    private id = 'serenity-protractor-plugin';

    private allDone = new Deferred();

    setup() {
        // todo: the path should be configurable
        this.scribe = new Scribe(new FileSystemOutlet(`${process.cwd()}/target/site/serenity`));
    };

    postTest(passed: boolean, info: TestInfo): Promise<any> {
        return Promise.all([
            this.reporter.of(Serenity.readNewJournalEntriesAs(this.id)).then( (reports) => {
                this.scribe.write(reports.pop(), `${this.hash(info.category, info.name)}.json`);
            }),
            this.printEvents ? this.printAll() : Promise.resolve(),
        ])
        .then(() => {
            console.log('finished writing the reports');  // tslint:disable-line:no-console

            this.allDone.resolve();
        });
    }

    postResults(): Promise<void> {
        return Promise.resolve();
    }

    teardown(): Promise<any> {
        // https://github.com/angular/protractor/issues/1938

        return this.allDone.promise;
    }

    private printAll(): Promise<void> {
        return this.debug.of(Serenity.readNewJournalEntriesAs('debug')).then( entries => {
            entries.forEach(entry => console.log(entry));   // tslint:disable-line:no-console
        });
    }

    private hash(...values: string[]): string {
        return <string> Md5.hashAsciiStr(values.join(':'));
    }
}
