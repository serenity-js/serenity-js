import chai = require('chai');
import sinonChai = require('sinon-chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(sinonChai);
chai.use(chaiAsPromised);

export const expect = chai.expect;
