import { stage } from '@integration/testing-tools';
import { Actor, DressingRoom } from '@serenity-js/core';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { CallAnApi } from '../src';

export class APIActors implements DressingRoom {
    constructor(private readonly axiosInstance: AxiosInstance) {
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(CallAnApi.using(this.axiosInstance));
    }
}

export function actorUsingAMockedAxiosInstance(config: AxiosRequestConfig = {}) {
    const
        axiosInstance = axios.create(config),
        mock = new MockAdapter(axiosInstance),
        actor = stage(new APIActors(axiosInstance)).actor('Apisit');

    return { mock, actor };
}
