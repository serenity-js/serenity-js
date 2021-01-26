import { Answerable, AnswersQuestions, CollectsArtifacts, ConfigurationError, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted, Path } from '@serenity-js/core/lib/io';
import { CallAnApi } from '@serenity-js/rest';
import { AxiosRequestConfig } from 'axios';
import { DownloadProgressReport, Notification } from '../../model';
import { UseFileSystem } from '../abilities';

/**
 * @package
 */
export class StreamResponse extends Interaction {

    static to(request: Answerable<AxiosRequestConfig>) {
        return {
            to: (destination: Path) => new StreamResponse(request, destination),
        };
    }

    constructor(
        private readonly request: Answerable<AxiosRequestConfig>,
        private readonly destination: Path,
    ) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & CollectsArtifacts & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~CollectsArtifacts}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.request)
            .then((config: AxiosRequestConfig) => CallAnApi.as(actor).request({
                ...config,
                responseType: 'stream',
            })
            .then(response => {
                if (response.status !== 200) {
                    throw new ConfigurationError(`Received: "${ response.status } ${ response.statusText }" when trying to download ${ config.url }`);
                }

                return response;
            })
            .then(response => new Promise((resolve, reject) => {

                actor.collect(Notification.fromJSON({ message: `Downloading ${ config.url } to ${ this.destination.value }` }));

                const
                    totalBytes  = parseInt(response.headers['content-length'], 10),
                    output      = UseFileSystem.as(actor).createWriteStreamTo(this.destination);

                let totalDownloadedBytes  = 0;

                response.data.pipe(output);

                response.data.on('data', chunk => {
                    const downloadedBytes = chunk.length;
                    totalDownloadedBytes += downloadedBytes;

                    actor.collect(DownloadProgressReport.fromJSON({
                        downloadedBytes,
                        totalDownloadedBytes,
                        totalBytes,
                    }));
                });

                response.data.on('end', () => {
                    output.end();
                    return resolve();
                });

                response.data.on('error', error => reject(error));
            })));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString() {
        return formatted `#actor saves response to ${ this.request } in ${ this.destination.value }`;
    }
}
