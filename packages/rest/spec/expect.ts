import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import sinonChai = require('sinon-chai');

chai.use(chaiAsPromised);
chai.use(sinonChai);

export const expect = chai.expect;
