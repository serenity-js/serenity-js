var chai         = require('chai'),
    childProcess = require('child_process'),
    path         = require('path'),
    process      = require('process');

var expect = chai.expect;

// todo: setup to work with the "examples"
describe('Protractor Integration', () => {

    var args = [path.join(__dirname, 'protractor/protractor.conf.js')];


    it('works?', function(done) {

        this.timeout(60000);

        var child = childProcess
            .fork(path.resolve('node_modules/protractor/bin/protractor'), args)
            .on('error', function() {
                // console.log('error', arguments);
            })
            .on('exit', done)
            .on('close', function() {
                // console.log('close', arguments);
            })
            .on('disconnect', function() {
                // console.log('disconnect', arguments);
            })
            .on('message', function(errorCode) {
                // console.log('message', arguments);
            });
        process.on('SIGINT', child.kill);

    });
});