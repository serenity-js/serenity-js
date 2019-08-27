import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted, Path } from '@serenity-js/core/lib/io';
import { CallAnApi } from '@serenity-js/rest';
import { AxiosRequestConfig } from 'axios';
import { DownloadProgressReport } from '../../model';
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

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.request)
            .then(config => CallAnApi.as(actor).request({
                ...config,
                responseType: 'stream',
            }).
            then(response => new Promise((resolve, reject) => {

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

    toString() {
        return formatted `#actor saves response to ${ this.request } in ${ this.destination.value }`;
    }
}
