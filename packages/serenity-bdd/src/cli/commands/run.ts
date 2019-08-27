import { WithStage } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import * as path from 'path';
import { Argv } from '../Argv';
import { defaults } from '../defaults';
import { GAV } from '../model';
import { Printer } from '../Printer';
import { Complain, InvokeSerenityBDD, SerenityBDDArguments } from '../screenplay';
import { SystemProperties } from '../screenplay/questions/SystemProperties';
import { NotificationReporter, ProgressReporter } from '../stage';

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
        log: {
            default: defaults.log,
            choices: [ 'warn', 'info', 'debug' ],
            describe: `A Logback log level to pass to the Serenity BDD CLI jar`,
        },
    },
    handler: (argv: Argv & WithStage) => {

        const
            printer         = new Printer(process.stdout, process.stderr),
            actor           = argv.stage.theActorCalled('Serenity/JS'),
            artifactGAV     = GAV.fromString(argv.artifact),
            pathToArtifact  = new Path(argv.cacheDir).join(artifactGAV.toPath()),
            moduleRoot      = path.resolve(__dirname, '../../../');

        argv.stage.assign(
            new NotificationReporter(printer),
            new ProgressReporter(printer),
        );

        return actor.attemptsTo(
            InvokeSerenityBDD.at(pathToArtifact)
                .withProperties(SystemProperties.from({
                    'LOG_LEVEL': argv.log,
                    'logback.configurationFile': path.resolve(moduleRoot, './resources/logback.config.xml'),
                }))
                .withArguments(SerenityBDDArguments.from(argv)),
        )
        .catch(error => actor.attemptsTo(
            Complain.about(error),
        ));
    },
};
