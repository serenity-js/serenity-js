// import { handler as runSerenityCli } from '../../serenity-cli/commands/run';
// import { defaults } from '../../serenity-cli/config';
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

    private reporter    = new RehearsalReport();
    // private debug       = new EventLog();

    private scribe;
    private id = 'serenity-protractor-plugin';

    setup() {
        // todo: the path should be configurable
        this.scribe = new Scribe(new FileSystemOutlet(`${process.cwd()}/target/site/serenity`));
    };

    postTest(passed: boolean, info: TestInfo): Promise<any> {
        // todo: the reporters should be configurable
        return Promise.all([
            this.reporter.of(Serenity.readNewJournalEntriesAs(this.id)).then( (reports) => {
                this.scribe.write(reports.pop(), `${this.hash(info.category, info.name)}.json`);
            }),
            // this.debug.of(Serenity.readNewJournalEntriesAs('debug')).then( entries => {
            //     entries.forEach(entry => console.log(entry));
            // }),
        ]);
    }

    postResults(): Promise<void> {
        return Promise.resolve();
        // return runSerenityCli(Object.assign({}, defaults, this.config));
    }

    private hash(...values: string[]): string {
        return <string> Md5.hashAsciiStr(values.join(':'));
    }
}
