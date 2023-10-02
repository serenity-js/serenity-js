import type { Actor, Cast} from '@serenity-js/core';
import { actorCalled, configure } from '@serenity-js/core';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { CallAnApi } from '../src';

export class APIActors implements Cast {
    constructor(private readonly axiosInstance: AxiosInstance) {
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(CallAnApi.using(this.axiosInstance));
    }
}

export function actorUsingAMockedAxiosInstance(config: AxiosRequestConfig = {}): { mock: MockAdapter, actor: Actor } {
    const
        axiosInstance = axios.create(config),
        mock = new MockAdapter(axiosInstance);

    configure({
        actors: new APIActors(axiosInstance),
    });

    return { mock, actor: actorCalled('Apisitt') };
}
