import { Answerable, AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { AxiosRequestConfig } from 'axios';

/**
 * @desc
 *  HTTP Request sent by the {@link @serenity-js/core/lib/screenplay/actor~Actor}
 *  using the {@link Send} {@link @serenity-js/core/lib/screenplay~Interaction}
 *
 * @abstract
 * @extends {Question<Promise<AxiosRequestConfig>>}
 */
export abstract class HTTPRequest extends Question<Promise<AxiosRequestConfig>> {

    /**
     * @protected
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<string>} [resourceUri]
     *  URL to which the request should be sent
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<any>} [data]
     *  Request body to be sent as part of the Put, Post or Patch request
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<AxiosRequestConfig>} [config]
     *  Axios request configuration, which can be used to override the defaults
     *  provided when the {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability} is instantiated
     */
    protected constructor(
        protected readonly resourceUri?: Answerable<string>,
        protected readonly data?: Answerable<any>,
        protected readonly config?: Answerable<AxiosRequestConfig>,
    ) {
        super('');
        this.subject = `${ this.requestDescription() } to ${ formatted `${ this.resourceUri }` }`;
    }

    /**
     * @desc
     *  Resolves the {@link Question} in the context of a given {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<AxiosRequestConfig>}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<AxiosRequestConfig> {
        return Promise.all([
                this.resourceUri ? actor.answer(this.resourceUri)   : Promise.resolve(void 0),
                this.config      ? actor.answer(this.config)        : Promise.resolve({}),
                this.data        ? actor.answer(this.data)          : Promise.resolve(void 0),
            ])
            .then(([url, config, data]) =>
                // tslint:disable-next-line:prefer-object-spread
                Object.assign(
                    {},
                    { url, data },
                    config,
                    { method: this.httpMethodName() },
                ),
            )
            .then(config =>
                Object.keys(config).reduce((acc, key) => {
                    if (!! config[key]) {
                        acc[key] = config[key];
                    }
                    return acc;
                }, {})
            );
    }

    /**
     * Determines the request method based on the name of the request class.
     * For example: GetRequest => GET, PostRequest => POST, etc.
     */
    private httpMethodName(): string {
        return this.constructor.name.replace(/Request/, '').toUpperCase();
    }

    /**
     * A human-readable description of the request, such as "a GET request", "an OPTIONS request", etc.
     */
    private requestDescription(): string {
        const
            vowels = [ 'A', 'E', 'I', 'O', 'U' ],
            method = this.httpMethodName();

        return `${ ~vowels.indexOf(method[0]) ? 'an' : 'a' } ${ method } request`;
    }
}
