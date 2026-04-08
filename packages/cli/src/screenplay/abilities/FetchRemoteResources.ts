import { Ability } from '@serenity-js/core';
import type { AxiosInstance } from 'axios';
import axios from 'axios';

/**
 * An {@link Ability} that enables an {@link Actor} to fetch remote resources
 * such as the module-manager.json configuration.
 *
 * ## Example
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core';
 * import { FetchRemoteResources, ModuleManagerConfig } from '@serenity-js/cli';
 *
 * const actor = actorCalled('Alice').whoCan(
 *     FetchRemoteResources.using()
 * );
 *
 * const config = await actor.answer(ModuleManagerConfig());
 * ```
 *
 * @group Abilities
 */
export class FetchRemoteResources extends Ability {

    /**
     * Creates an ability to fetch remote resources using the provided Axios instance.
     *
     * @param axiosInstance - Optional Axios instance (defaults to a new instance with 30s timeout)
     */
    static using(axiosInstance: AxiosInstance = axios.create({ timeout: 30_000 })): FetchRemoteResources {
        return new FetchRemoteResources(axiosInstance);
    }

    /**
     * Creates an ability to fetch remote resources.
     *
     * @param axiosInstance - The Axios instance to use for HTTP requests
     */
    constructor(
        private readonly axiosInstance: AxiosInstance,
    ) {
        super();
    }

    /**
     * Fetches a remote resource and returns the parsed JSON response.
     *
     * @param url - The URL to fetch
     * @returns A promise that resolves to the parsed JSON response
     * @throws Error if the request fails
     */
    async fetch<T>(url: string): Promise<T> {
        try {
            const response = await this.axiosInstance.get<T>(url);
            return response.data;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to fetch ${ url }: ${ message }`);
        }
    }
}
