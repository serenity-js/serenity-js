import chai = require('chai');
import chai_as_promised = require('chai-as-promised');
import sinon_chai = require('sinon-chai');

chai.use(<any> sinon_chai);
chai.use(<any> chai_as_promised);

export = chai.expect;
