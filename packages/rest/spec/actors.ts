import { Actor } from '@serenity-js/core';
import axios, { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { CallAnApi } from '../src';

export function actorUsingAMockedAxiosInstance(config: AxiosRequestConfig = {}) {
    const
        axiosInstance = axios.create(config),
        mock = new MockAdapter(axiosInstance),
        actor = Actor.named('Apisit').whoCan(CallAnApi.using(axiosInstance));

    return { mock, actor };
}
