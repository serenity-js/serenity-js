import {Ability, UsesAbilities} from '@serenity-js/core/lib/screenplay';
import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';

/**
 * Call an Api is the ability to correspond with an Api by the npm package axios.
 */
export class CallAnApi implements Ability {

    private lastResponse: AxiosResponse;

    /**
     * ability to Call and api at a specific baseUrl
     * Timeout is set to 1s and headers Accept application/json and application/xml
     *
     * @param {string} baseURL
     * @returns {CallAnApi}
     */
    static at(baseURL: string) {
        const axiosInstance: AxiosInstance = axios.create({
            baseURL,
            timeout: 1000,
            headers: { Accept: 'application/json,application/xml'},
        });
        return new CallAnApi(axiosInstance);
    }

    /**
     * Ability to Call an Api with a given axios instance.
     *
     * @param {AxiosInstance} axiosInstance
     * @returns {CallAnApi}
     */
    static using(axiosInstance: AxiosInstance) {
        return new CallAnApi(axiosInstance);
    }

    /**
     * Used to access the Actor's ability to CallAnApi from within the Interaction classes, such as GET or PUT
     *
     * @param actor
     * @return {CallAnApi}
     */
    static as(actor: UsesAbilities): CallAnApi {
        return actor.abilityTo(CallAnApi);
    }

    /**
     * Call the api method get on the url.
     * Every response will be resolved and put into the lastResponse.
     *
     * @param {string} url
     * @param {AxiosRequestConfig} config
     * @returns {PromiseLike<void>}
     */
    get(url: string, config?: AxiosRequestConfig): PromiseLike<void> {
        return this.axiosInstance.get(url, config).then(
            fulfilled => Promise.resolve(this.lastResponse = fulfilled),
            rejected => Promise.resolve(this.lastResponse = rejected),
        );
    }

    /**
     * Call the api method post on the url.
     * Every response will be resolved and put into the lastResponse.
     *
     * @param {string} url
     * @param data
     * @param {AxiosRequestConfig} config
     * @returns {PromiseLike<void>}
     */
    post(url: string, data?: any, config?: AxiosRequestConfig): PromiseLike<void> {
        return this.axiosInstance.post(url, data, config).then(
            fulfilled => Promise.resolve(this.lastResponse = fulfilled),
            rejected => Promise.resolve(this.lastResponse = rejected),
        );
    }

    getLastResponse(): PromiseLike<AxiosResponse> {
        return Promise.resolve(this.lastResponse);
    }

    constructor(private axiosInstance: AxiosInstance) {
    }

}
