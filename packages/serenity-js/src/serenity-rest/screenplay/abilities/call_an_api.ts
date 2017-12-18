import { Ability, UsesAbilities } from '@serenity-js/core/src/screenplay';
import request = require('request-promise');

/**
 * Call an Api is the ability to correspond with an Api by the npm package require-response.
 */
export class CallAnApi implements Ability {

    private response: PromiseLike<any>;

    /**
     *
     * Instantiates the Ability to CallAnApi, allowing the Actor to interact with a Rest api
     *
     * @param uri of the endpoint
     * @return {CallAnApi}
     */
    static usingEndpoint(uri: string) {
        return new CallAnApi(uri);
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
     * call the api with a method, uri and if the resource is in json or not.
     *
     * @param {String} method
     * @param {string} resource
     * @param {boolean} json
     * @returns {PromiseLike<void>}
     */
    call(method: string, resource: string, json: boolean): PromiseLike<void> {
        const url = this.apiUri.concat(resource);
        const options = {
            method,
            uri: url,
            json,
        };
        return this.response = request(options).promise();
    }

    /**
     * call the api with a method, uri, body and if the resource is in json or not.
     *
     * @param {string} method
     * @param {string} resource
     * @param body
     * @param {boolean} json
     * @returns {PromiseLike<void>}
     */
    callWithBody(method: string, resource: string, body: any, json: boolean): PromiseLike<void> {
        const url = this.apiUri.concat(resource);
        const options = {
            method,
            uri: url,
            body,
            json,
        };
        return this.response = request(options).promise();
    }

    /**
     * Get the Response of the api.
     *
     * @returns {PromiseLike<any>}
     */
    getResponse(): PromiseLike<any> {
        return this.response;
    }

    /**
     *
     * @param {string} apiUri
     */
    constructor(private apiUri: string) {

    }

}
