import {ProtractorPlugin} from 'protractor/built/plugins';

import serenity = require('../../index');

export default class SerenityProtractorPlugin extends ProtractorPlugin {
    setup() {
        // console.log("options:", this.config['integration']);
        
        // console.log('initialised: ', Serenity.instance.name());
        console.log('initialised: ', serenity.name());
    };
};