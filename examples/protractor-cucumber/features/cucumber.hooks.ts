import { serenityCucumberListener } from 'serenity/lib/adapters';

export = function () {
    this.registerListener(serenityCucumberListener());
};
