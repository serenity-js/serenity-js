import chaiModule = require('chai');
import chaiAsPromised = require('chai-as-promised');

chaiModule.use(chaiAsPromised);

export const expect = chaiModule.expect;
