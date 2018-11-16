import * as express from 'express';

import { Calculator } from '../Calculator';
import { controllers } from './controllers';

export const requestHandler = controllers(express(), new Calculator());
