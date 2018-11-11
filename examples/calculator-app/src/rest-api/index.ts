import * as express from 'express';

import { Calculator } from '../Calculator';
import { controllers } from './controllers';

export = controllers(express(), new Calculator());
