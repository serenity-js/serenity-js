import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { assertions } from './tiny-types';

chai.use(chaiAsPromised);
chai.use(assertions);

export const expect = chai.expect;
