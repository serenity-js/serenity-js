import {CallAnApi} from '../abilities';
import {Question} from '@serenity-js/core/lib/screenplay';
import {AxiosResponse} from 'axios';

export const LastResponse = () => Question.about(`The Message`, actor =>
    CallAnApi.as(actor).getLastResponse() as PromiseLike<AxiosResponse>,
);