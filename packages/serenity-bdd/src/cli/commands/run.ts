import { actorCalled, configure } from '@serenity-js/core';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/lib/io';
import * as path from 'path'; // eslint-disable-line unicorn/import-style
import * as process from 'process';

import type { Argv } from '../Argv';
import { defaults } from '../defaults';
import { formatError } from '../io';
import { GAV } from '../model';
import { Printer } from '../Printer';
import { InvokeSerenityBDD, SerenityBDDArguments, SystemProperties } from '../screenplay';
import { NotificationReporter, ProgressReporter, RunCommandActors } from '../stage';

const yargs = require('yargs'); // eslint-disable-line @typescript-eslint/no-var-requires

const cwd = new Path(process.cwd());

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
            default:   cwd.relative(new RequirementsHierarchy(new FileSystem(cwd)).rootDirectory()),
            describe: 'A relative path to the requirements hierarchy root directory, such as "./features" or "./spec"',
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
            default: cwd.basename(),
            describe: `Project name to appear in the Serenity reports`,
        },
        shortFilenames: {
            default: true,
            type: 'boolean',
            describe: `Use unique hashes instead of human-readable names for the HTML files`,
        },
        log: {
            default: defaults.log,
            choices: [ 'warn', 'info', 'debug' ],
            describe: `A Logback log level to pass to the Serenity BDD CLI jar`,
        },
    },
    handler: async (argv: Argv): Promise<void> => {

        const
            printer = new Printer(process.stdout, process.stderr),
            artifactGAV = GAV.fromString(argv.artifact),
            pathToArtifact = new Path(argv.cacheDir).join(artifactGAV.toPath()),
            moduleRoot = path.resolve(__dirname, '../../../');

        configure({
            actors: new RunCommandActors(cwd),
            crew: [
                new NotificationReporter(printer),
                new ProgressReporter(printer),
            ],
        });

        const actor = actorCalled('Serenity/JS Reporter');

        try {
            await actor.attemptsTo(
                InvokeSerenityBDD.at(pathToArtifact)
                    .withProperties(SystemProperties.of({
                        'LOG_LEVEL': argv.log,
                        'logback.configurationFile': path.resolve(moduleRoot, './resources/logback.config.xml'),
                        'serenity.compress.filenames': `${ argv.shortFilenames }`,
                        // Serenity BDD requires both --features and this property for FeatureFilePath to work
                        // see https://github.com/serenity-bdd/serenity-core/blob/a997617f5a43b5d46a3a81da875b8f850a9c21ab/serenity-model/src/main/java/net/thucydides/model/requirements/FeatureFilePath.java#L10
                        'serenity.features.directory': argv.features,
                    }))
                    .withArguments(SerenityBDDArguments.from(argv)),
            );
            await actor.dismiss();
        }
        catch (error) {
            printer.error(formatError(error));
            yargs.exit(1, error.message);
        }
    },
};
