import { Check, isTrue } from '@serenity-js/assertions';
import { actorCalled, actorInTheSpotlight, configure } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { AxiosRequestConfig } from 'axios';
import * as https from 'https';
import { URL } from 'url';

import { Argv } from '../Argv';
import { defaults } from '../defaults';
import { Credentials, GAV } from '../model';
import { Printer } from '../Printer';
import { Complain, DownloadArtifact, FileExists, Notify } from '../screenplay';
import { Actors, NotificationReporter, ProgressReporter } from '../stage';

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
            type:     'boolean',
            describe: 'Ignore SSL certificates',
        },
        repository: {
            default:   defaults.repository,
            describe: 'Maven repository url where we should look for the Serenity BDD CLI artifact',
        },
        auth: {
            describe: `Credentials to authenticate with your repository - "<username>:<password>"`,
        },
        artifact: {
            default:   defaults.artifact,
            describe: `The GAV identifier of the Serenity BDD CLI artifact to use; You're best off with the default option unless you want to experiment.`,
        },
    },
    handler: (argv: Argv) => {

        const
            printer         = new Printer(process.stdout, process.stderr),
            artifactGAV     = GAV.fromString(argv.artifact),
            pathToArtifact  = new Path(argv.cacheDir).join(artifactGAV.toPath()),
            repository      = new URL(argv.repository),
            requestConfig: AxiosRequestConfig = {
                httpsAgent: new https.Agent({
                    rejectUnauthorized: ! argv.ignoreSSL,
                }),
                auth: Credentials.fromString(argv.auth),
            };

        configure({
            actors: new Actors(new Path(process.cwd())),
            crew: [
                new NotificationReporter(printer),
                new ProgressReporter(printer),
            ],
        });

        return actorCalled('Serenity/JS').attemptsTo(
            Check.whether(FileExists.at(pathToArtifact), isTrue())
                .andIfSo(
                    Notify.that(`Looks like you're good to go! Serenity BDD CLI is already at ${ pathToArtifact.value }`),
                )
                .otherwise(
                    DownloadArtifact
                        .identifiedBy(artifactGAV)
                        .availableFrom(repository)
                        .to(pathToArtifact.directory())
                        .using(requestConfig),
                ),
            )
            .catch(error => actorInTheSpotlight().attemptsTo(
                Complain.about(error),
            ));
    },
};
