import chai = require('chai');

import sinonChai = require('sinon-chai');
import chaiAsPromised = require('chai-as-promised');
import chaiSmoothie = require('chai-smoothie');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiSmoothie);

const expect = chai.expect;

export = expect;
