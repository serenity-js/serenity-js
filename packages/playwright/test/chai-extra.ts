import * as chaiLib from 'chai';
import * as chaiAsPromisedLib from 'chai-as-promised';
import * as sinonChaiLib from 'sinon-chai';

chaiLib.use(chaiAsPromisedLib);
chaiLib.use(sinonChaiLib);

export const chai = chaiLib;
