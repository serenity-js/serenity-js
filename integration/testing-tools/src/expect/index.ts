import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { assertions } from './tiny-types';

chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.use(assertions);

export const expect = chai.expect;
