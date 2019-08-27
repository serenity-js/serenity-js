import { Check, equals } from '@serenity-js/assertions';
import { WithStage } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import * as https from 'https';
import { URL } from 'url';
import { Argv } from '../Argv';
import { defaults } from '../defaults';
import { GAV } from '../model';
import { Printer } from '../Printer';
import { Complain, DownloadArtifact, FileExists, Notify } from '../screenplay';
import { NotificationReporter, ProgressReporter } from '../stage';

export = {
    command: 'update',
    desc: 'Makes sure the Serenity BDD CLI jar file is available and up to date',
    builder: {
        cacheDir: {
            default:   defaults.cacheDir,
            describe: 'A relative path to where the Serenity BDD CLI jar file should be stored',
        },
        ignoreSSL: {
            default:   false,
            describe: 'Ignore SSL certificates',
        },
        repository: {
            default:   defaults.repository,
            describe: 'Maven repository url where we should look for the Serenity BDD CLI artifact',
        },
        artifact: {
            default:   defaults.artifact,
            describe: `The GAV identifier of the Serenity BDD CLI artifact to use; You're best off with the default option unless you want to experiment.`,
        },
    },
    handler: (argv: Argv & WithStage) => {

        const
            printer         = new Printer(process.stdout, process.stderr),
            actor           = argv.stage.theActorCalled('Serenity/JS'),
            artifactGAV     = GAV.fromString(argv.artifact),
            pathToArtifact  = new Path(argv.cacheDir).join(artifactGAV.toPath()),
            repository      = new URL(argv.repository),
            httpsConfig     = { httpsAgent: new https.Agent({ rejectUnauthorized: ! argv.ignoreSSL }) };

        argv.stage.assign(
            new NotificationReporter(printer),
            new ProgressReporter(printer),
        );

        return actor.attemptsTo(
            Check.whether(FileExists.at(pathToArtifact), equals(true))
                .andIfSo(
                    Notify.that(`Looks like you're good to go! Serenity BDD CLI is already at ${ pathToArtifact.value }`),
                )
                .otherwise(
                    DownloadArtifact
                        .identifiedBy(artifactGAV)
                        .availableFrom(repository)
                        .to(pathToArtifact.directory())
                        .using(httpsConfig),
                ),
            )
            .catch(error => actor.attemptsTo(
                Complain.about(error),
            ));
    },
};
