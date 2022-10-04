import { Answerable, AnswersQuestions, Question, UsesAbilities, WithAnswerableProperties } from '@serenity-js/core';
import { d } from '@serenity-js/core/lib/io';
import { AxiosRequestConfig } from 'axios';

/**
 * HTTP Request sent by the {@apilink Actor}
 * using the {@apilink Interaction|interaction} to {@apilink Send}
 *
 * @group Models
 */
export abstract class HTTPRequest extends Question<Promise<AxiosRequestConfig>> {

    private subject: string;

    /**
     * @param [resourceUri]
     *  URL to which the request should be sent
     *
     * @param [data]
     *  Request body to be sent as part of the Put, Post or Patch request
     *
     * @param {Answerable<WithAnswerableProperties<AxiosRequestConfig>>} [config]
     *  Axios request configuration, which can be used to override the defaults
     *  provided when the {@apilink Ability|ability} to {@apilink CallAnApi} is instantiated
     */
    protected constructor(
        protected readonly resourceUri?: Answerable<string>,
        protected readonly data?: Answerable<any>,
        protected readonly config?: Answerable<WithAnswerableProperties<AxiosRequestConfig>>,
    ) {
        super();
        this.subject = `${ this.requestDescription() } to ${ d`${ this.resourceUri }` }`;
    }

    /**
     * @inheritDoc
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<AxiosRequestConfig> {
        return Promise.all([
            this.resourceUri ? actor.answer(this.resourceUri)   : Promise.resolve(void 0),
            this.config      ? actor.answer(this.config)        : Promise.resolve({}),
            this.data        ? actor.answer(this.data)          : Promise.resolve(void 0),
        ]).
        then(([url, config, data]) =>

            Object.assign(
                {},
                { url, data },
                config,
                { method: this.httpMethodName() },
            ),
        ).
        then(config =>
            // eslint-disable-next-line unicorn/prefer-object-from-entries
            Object.keys(config).reduce((acc, key) => {
                if (config[key] !== null && config[key] !== undefined ) {
                    acc[key] = config[key];
                }
                return acc;
            }, {})
        );
    }

    /**
     * @inheritDoc
     */
    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return this.subject;
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
