import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';

import { assertions } from './tiny-types';

chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.use(assertions);

export const expect = chai.expect;
