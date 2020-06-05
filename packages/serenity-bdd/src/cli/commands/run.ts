import { actorCalled, actorInTheSpotlight, configure } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import * as path from 'path';
import { Argv } from '../Argv';
import { defaults } from '../defaults';
import { GAV } from '../model';
import { Printer } from '../Printer';
import { Complain, InvokeSerenityBDD, SerenityBDDArguments } from '../screenplay';
import { SystemProperties } from '../screenplay/questions/SystemProperties';
import { Actors, NotificationReporter, ProgressReporter } from '../stage';

export = {
    command: 'run',
    desc: 'Invokes the Serenity BDD CLI jar to produce a Serenity BDD HTML report from the Serenity/JS JSON reports',
    builder: {
        cacheDir: {
            default:   defaults.cacheDir,
            describe: 'A relative path to where the Serenity BDD CLI jar file is stored',
        },
        destination: {
            default:   defaults.reportDir,
            describe: 'A relative path to the directory where the Serenity BDD report should be produced',
        },
        features: {
            default:   defaults.featuresDir,
            describe: 'A relative path to the directory containing the Cucumber.js feature files',
        },
        artifact: {
            default:   defaults.artifact,
            describe: `The GAV identifier of the Serenity BDD CLI artifact to use; You're best off with the default option unless you want to experiment.`,
        },
        source: {
            default:   defaults.sourceDir,
            describe: `A relative path to the directory containing the Serenity/JS JSON reports`,
        },
        issueTrackerUrl: {
            describe: `Base URL for issue trackers other than JIRA`,
        },
        jiraProject: {
            describe: `JIRA project identifier`,
        },
        jiraUrl: {
            describe: `Base URL of your JIRA server`,
        },
        project: {
            default: path.basename(process.cwd()),
            describe: `Project name to appear in the Serenity reports`,
        },
        shortFilenames: {
            default: false,
            type: 'boolean',
            describe: `Use unique hashes instead of human-readable names for the HTML files`,
        },
        log: {
            default: defaults.log,
            choices: [ 'warn', 'info', 'debug' ],
            describe: `A Logback log level to pass to the Serenity BDD CLI jar`,
        },
    },
    handler: (argv: Argv) => {

        const
            printer         = new Printer(process.stdout, process.stderr),
            artifactGAV     = GAV.fromString(argv.artifact),
            pathToArtifact  = new Path(argv.cacheDir).join(artifactGAV.toPath()),
            moduleRoot      = path.resolve(__dirname, '../../../');

        configure({
            actors: new Actors(new Path(process.cwd())),
            crew: [
                new NotificationReporter(printer),
                new ProgressReporter(printer),
            ],
        });

        return actorCalled('Serenity/JS').attemptsTo(
            InvokeSerenityBDD.at(pathToArtifact)
                .withProperties(SystemProperties.from({
                    'serenity.compress.filenames': `${ argv.shortFilenames }`,
                    'LOG_LEVEL': argv.log,
                    'logback.configurationFile': path.resolve(moduleRoot, './resources/logback.config.xml'),
                }))
                .withArguments(SerenityBDDArguments.from(argv)),
        )
        .catch(error => actorInTheSpotlight().attemptsTo(
            Complain.about(error),
        ));
    },
};
