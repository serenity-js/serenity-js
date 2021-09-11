import express = require('express');
import { resolve } from 'path';

export const app = express()
    .use('/', express.static(resolve(__dirname, '../static')));
