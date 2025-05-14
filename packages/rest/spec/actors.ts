import { Cast } from '@serenity-js/core';
import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { CallAnApi } from '../src';

export function actors(config: AxiosRequestConfig = {}): { mock: MockAdapter, actors: Cast } {
    const axiosInstance = axios.create(config);

    return {
        mock: new MockAdapter(axiosInstance),
        actors: Cast.where(actor => actor.whoCan(CallAnApi.using(axiosInstance)))
    };
}
